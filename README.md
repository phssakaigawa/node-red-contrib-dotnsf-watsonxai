# watsonx.ai based query Node for Node-RED


## Overview

Query-able node based on watsonx.ai


## Pre-requisite

You need to get account in [IBM Cloud](https://cloud.ibm.com/) first.

You also have to prepare **IAM API Key** of your IBM Cloud account. You also need **Project ID** for your project of IBM Watson Studio and IBM Watson Machine Learning, lite(free) plan would be OK.

At last, you would prepare [Node-RED](https://nodered.org/).


## How to use

1. In Node-RED, you can search [node-red-contrib-dotnsf-watsonxai](https://www.npmjs.com/package/node-red-contrib-dotnsf-watsonxai) node. You need to install this node in your Node-RED.

2. You will see **watsonx.ai** node under `function` category. Drag & Drop this node into Node-RED's canvas.

3. Open properties box. You need to edit **API Key** field with your API Key.

4. You also need to edit **END POINT URL** field with your END POINT URL.

5. You also need to edit **Project ID** field with your Project ID.

6. Connect nodes. You have to input query text as **msg.payload** into watsonx.ai node. Then watsonx.ai node would output generated text in its **msg.payload**.


## Licensing

This code is licensed under MIT.


## Copyright

2023 K.Kimura @ Juge.Me all rights reserved.

