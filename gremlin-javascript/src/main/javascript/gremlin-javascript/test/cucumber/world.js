/*
 *  Licensed to the Apache Software Foundation (ASF) under one
 *  or more contributor license agreements.  See the NOTICE file
 *  distributed with this work for additional information
 *  regarding copyright ownership.  The ASF licenses this file
 *  to you under the Apache License, Version 2.0 (the
 *  "License"); you may not use this file except in compliance
 *  with the License.  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 */

/**
 * @author Jorge Bay Gondra
 */
'use strict';

const defineSupportCode = require('cucumber').defineSupportCode;
const helper = require('../helper');
const graphModule = require('../../lib/structure/graph');
const graphTraversalModule = require('../../lib/process/graph-traversal');
const Graph = graphModule.Graph;
const __ = graphTraversalModule.statics;

defineSupportCode(function (methods) {
  const cache = {};

  function TinkerPopWorld(){
    this.g = null;
    this.traversal = null;
    this.result = null;
    this.cache = null;
    this.graphName = null;
    this.parameters = {};
  }

  TinkerPopWorld.prototype.getData = function () {
    if (!this.graphName) {
      throw new Error("Graph name is not set");
    }
    return this.cache[this.graphName];
  };

  TinkerPopWorld.prototype.cleanEmptyGraph = function () {
    const connection = this.cache['empty'].connection;
    const g = new Graph().traversal().withRemote(connection);
    return g.V().drop().toList();
  };

  TinkerPopWorld.prototype.loadEmptyGraphData = function () {
    const cacheData = this.cache['empty'];
    const c = cacheData.connection;
    return Promise.all([ getVertices(c), getEdges(c) ]).then(values => {
      cacheData.vertices = values[0];
      cacheData.edges = values[1];
    });
  };

  methods.setWorldConstructor(TinkerPopWorld);

  methods.BeforeAll(function () {
    // load all traversals
    const promises = ['modern', 'classic', 'crew', 'grateful', 'empty'].map(graphName => {
      let connection = null;
      if (graphName === 'empty') {
        connection = helper.getConnection('ggraph');
        return connection.open().then(() => cache['empty'] = { connection: connection });
      }
      connection = helper.getConnection('g' + graphName);
      return connection.open()
        .then(() => Promise.all([getVertices(connection), getEdges(connection)]))
        .then(values => {
          cache[graphName] = {
            connection: connection,
            vertices: values[0],
            edges: values[1]
          };
        });
    });
    return Promise.all(promises);
  });

  methods.AfterAll(function () {
    return Promise.all(Object.keys(cache).map(graphName => cache[graphName].connection.close()));
  });

  methods.Before(function () {
    this.cache = cache;
  });
});

function getVertices(connection) {
  const g = new Graph().traversal().withRemote(connection);
  return g.V().group().by('name').by(__.tail()).next().then(it => it.value);
}

function getEdges(connection) {
  const g = new Graph().traversal().withRemote(connection);
  return g.E().group()
    .by(__.project("o", "l", "i").by(__.outV().values("name")).by(__.inV().values("name")))
    .by(__.tail())
    .next()
    .then(it => {
      const edges = {};
      Object.keys(it.value).map(key => {
        edges[getEdgeKey(key)] = it.value[key];
      });
      return edges;
    });
}

function getEdgeKey(key) {
  const o = /o=(.+?)[,}]/.exec(key)[1];
  const l = /l=(.+?)[,}]/.exec(key)[1];
  const i = /i=(.+?)[,}]/.exec(key)[1];
  return o + "-" + l + "->" + i;
}