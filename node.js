var axiosBase = require( 'axios' );
require( 'dotenv' ).config();

var env_apikey = 'APIKEY' in process.env ? process.env.APIKEY : ''; 
var env_project_id = 'PROJECT_ID' in process.env ? process.env.PROJECT_ID : ''; 
var env_model_id = 'MODEL_ID' in process.env ? process.env.MODEL_ID : 'ibm/mpt-7b-instruct2'; 

module.exports = function( RED ){
  async function getAccessToken( apikey ){
    return new Promise( function( resolve, reject ){
      if( apikey ){
        var axios = axiosBase.create({
          baseURL: 'https://iam.cloud.ibm.com',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          }
        });
  
        var params = new URLSearchParams();
        params.append( 'grant_type', 'urn:ibm:params:oauth:grant-type:apikey' );
        params.append( 'apikey', apikey );

        axios.post( '/identity/token', params )
        .then( function( result ){
          if( result && result.data && result.data.access_token ){
            //console.log( 'access_token = ' + result.data.access_token );
            resolve( { status: true, access_token: result.data.access_token } );
          }else{
            resolve( { status: false, error: 'no access_token retrieved.' } );
          }
        }).catch( function( err ){
          console.log( {err} );
          resolve( { status: false, error: err } );
        });
      }else{
        resolve( { status: false, error: 'no apikey provided.' } );
      }
    });
  }

  async function generateText( access_token, project_id, model_id, input, max_new_tokens ){
    return new Promise( function( resolve, reject ){
      if( access_token ){
        if( project_id && input && max_new_tokens ){
          var axios = axiosBase.create({
            baseURL: 'https://us-south.ml.cloud.ibm.com',
            responseType: 'json',
            headers: {
              'Authorization': 'Bearer ' + access_token,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          var data = {
            'model_id': model_id,
            'input': input,
            'parameters': {
              "decoding_method": "greedy",
              "max_new_tokens": max_new_tokens,
              "min_new_tokens": 0,
              "stop_sequences": [],
              "repetition_penalty": 1
            },
            'project_id': project_id 
          };
  
          axios.post( '/ml/v1-beta/generation/text?version=2023-05-29', data )
          .then( function( result ){
            //console.log( {result} );
            if( result && result.data && result.data.results ){
              resolve( { status: true, results: result.data.results } );
            }else{
              resolve( { status: false, error: 'no results found.' } );
            }
          }).catch( function( err ){
            //console.log( {err} );
            resolve( { status: false, error: err } );
          });
        }else{
          resolve( { status: false, error: 'Parameter project_id, model_id, input, and/or max_new_tokens are not provided.' } );
        }
      }else{
        resolve( { status: false, error: 'access_token is null.' } );
      }
    });
  }

  function main( config ){
    RED.nodes.createNode( this, config );
    var node = this;
    node.on( 'input', async function( msg ){
      node.status( { fill: "green", shape: "dot", text: "..." } );
      var max_new_tokens = 100;
      var text = msg.payload;
      var apikey = config.apikey;
      var model_id = config.model_id;
      var project_id = config.project_id;

      if( !apikey ){ apikey = env_apikey; }
      if( !project_id ){ project_id = env_project_id; }
      if( !model_id ){ model_id = env_model_id; }
      //console.log( {apikey} );
      if( apikey && project_id ){
        var result0 = await getAccessToken( apikey );
        if( result0 && result0.status && result0.access_token ){
          var result = await generateText( result0.access_token, project_id, model_id, text, max_new_tokens );
          if( result && result.status ){
            var results = result.results;
            if( results && results[0] && results[0].generated_text ){
              var generated_text = results[0].generated_text;
              var tmp = generated_text.split( '\\n' );
              if( tmp.length > 1 ){
                generated_text = tmp[0];
              }

              msg.payload = generated_text;
              node.status( {} );
              node.send( msg );
            }else{
              msg.payload = 'No generated text.';
              node.status( {} );
              node.send( msg );
            }
          }else{
            msg.payload = JSON.stringify( result.error );
            node.status( {} );
            node.send( msg );
          }
        }else{
          msg.payload = JSON.stringify( result0.error );
          node.status( {} );
          node.send( msg );
        }
      }else{
        msg.payload = 'API Key and/or Project ID missing.';
        node.status( {} );
        node.send( msg );
      }
    });
  };

  RED.nodes.registerType( 'watsonx.ai', main );
}
