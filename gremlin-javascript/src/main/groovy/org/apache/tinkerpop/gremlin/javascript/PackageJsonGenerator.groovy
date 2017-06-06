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

package org.apache.tinkerpop.gremlin.javascript

/**
 * @author Jorge Bay Gondra
 */
class PackageJsonGenerator {

    public static void create(final String traversalSourceFile, final String version) {

        final StringBuilder moduleOutput = new StringBuilder();
        moduleOutput.append("""{
  "name": "gremlin-javascript",
  "version": "${version}",
  "description": "JavaScript Gremlin Language Variant",
  "author": "Apache TinkerPop team",
  "keywords": [
    "graph",
    "gremlin",
    "tinkerpop",
    "connection",
    "glv",
    "driver",
    "graphdb"
  ],
  "license": "Apache-2.0",
  "dependencies": {
    "ws": "^3.0.0"
  },
  "devDependencies": {
    "mocha": ">= 1.14.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/apache/tinkerpop.git"
  },
  "bugs": {
    "url": "https://issues.apache.org/jira/browse/TINKERPOP"
  },
  "scripts": {
    "test": "./node_modules/.bin/mocha test --recursive -t 5000",
    "unit-test": "./node_modules/.bin/mocha test/unit"
  },
  "engines": {
    "node": ">=4"
  }
}"""    );

        // save to a file
        final File file = new File(traversalSourceFile);
        file.delete()
        moduleOutput.eachLine { file.append(it + "\n") }
    }
}
