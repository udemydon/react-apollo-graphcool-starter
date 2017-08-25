import path from 'path';
import chalk from 'chalk';
import { Server } from 'http';
import Express from 'express';
import open from 'open';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { match, RouterContext } from 'react-router';
import routes from './routes';
import NotFoundPage from './components/NotFoundPage';
import ApolloClient, { createNetworkInterface } from 'apollo-client'
import { ApolloProvider } from 'react-apollo'
import bodyParser from 'body-parser';
import webpack from 'webpack';
import config from '../webpack.config.dev';
import Environment from './utils/env';
require('fetch-everywhere');

import Exponent from 'exponent-server-sdk';
import gcool from './utils/apollo-client';
import gql from 'graphql-tag';

// initialize the server and configure support for ejs templates
const app = new Express();
const server = new Server(app);
const compiler = webpack(config);
let exponent = new Exponent();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(require('webpack-dev-middleware')(compiler, {
	noInfo: true,
	publicPath: config.output.publicPath
}))

// define the folder that will be used for static assets
app.use(Express.static(path.join(__dirname, 'static')));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

function chunkPushNotifications(messages){
    // Since we can't automatically upgrade everyone using this library, we
    // should strongly try not to decrease it
    const chunkLimit = 100;
    let chunks = [];
    let chunk = [];
    for (let message of messages) {
        chunk.push(message);
        if (chunk.length >= chunkLimit) {
            chunks.push(chunk);
            chunk = [];
        }
    }
    if (chunk.length) {
        chunks.push(chunk);
    }
    return chunks;
}

async function _sendNotificationAsync(chunk) {
    try {
        let receipts = await exponent.sendPushNotificationsAsync(chunk);
        console.log("Receipts:",receipts);
    } catch (error) {
        console.error("Error:",error);
    }
}

app.post("/sendNotification", (req, response) => {
    const id = req.body.id;
    const title = req.body.title;
    console.log(id, title)
    const TokensQuery = gql`
          query PushTokens {
            allPushTokens{
              token
            }
          }
    `;

    gcool.query({
        query: TokensQuery,
        fetchPolicy: 'network-only'
    }).then ((res) => {
            let tokens =  res.data.allPushTokens;
            console.log("Tokens:",tokens.length);
            let allPushNotifs = [];
            for(var i=0;i<tokens.length; i++){
                console.log("Sending notif using token:",tokens[i].token);
                //_sendNotification(id,title, tokens[i].token);

                let isPushToken = Exponent.isExponentPushToken(tokens[i].token);
                if(isPushToken){
                    allPushNotifs.push({
                        to: tokens[i].token,
                        sound: 'default',
                        body: title,
                        data: {id, title, type: 'POST'}
                    });
                }
            }
            let chunks = chunkPushNotifications(allPushNotifs);
            //console.log("All Push Notifs:",allPushNotifs);
            //console.log("Chunks:",chunks);
            for(let chunk of chunks){
                            _sendNotificationAsync(chunk);
            }


            response.end("Success sending Notifs");


    }, (err) => {
         console.log("ERROR is:", err);
         response.end("Error sending Notifs");
        }
    )

})

// universal routing and rendering
app.get('*', (req, res) => {
    match(
        { routes, location: req.url },
        (err, redirectLocation, renderProps) => {

            // in case of error display the error message
            if (err) {
                return res.status(500).send(err.message);
            }

            // in case of redirect propagate the redirect to the browser
            if (redirectLocation) {
                return res.redirect(302, redirectLocation.pathname + redirectLocation.search);
            }

            // generate the React markup for the current route
            let markup;
            if (renderProps) {
                // if the current route matched we have renderProps
                //markup = renderToString(<RouterContext {...renderProps}/>);
                const client = new ApolloClient({
                    ssrMode: true,
                    // Remember that this is the interface the SSR server will use to connect to the
                    // API server, so we need to ensure it isn't firewalled, etc
                    networkInterface: createNetworkInterface({
                        uri:Environment.GCOOL_ENDPOINT,
                        opts: {
                            credentials: 'same-origin',
                            // transfer request headers to networkInterface so that they're accessible to proxy server
                            // Addresses this issue: https://github.com/matthew-andrews/isomorphic-fetch/issues/83
                            headers: req.headers,
                        },
                    }),
                });

                const app = (
                    <ApolloProvider client={client}>
                        <RouterContext {...renderProps} />
                    </ApolloProvider>
                );
                markup = renderToString(app);
            } else {
                // otherwise we can render a 404 page
                markup = renderToString(<NotFoundPage/>);
                res.status(404);
            }

            // render the index template with the embedded React markup
            return res.render('index', { markup });
        }
    );
});

// start the server
const port = process.env.PORT || 3000;
const env = process.env.NODE_ENV || 'dev';
console.log(chalk.green("Current Environment is:", env));
console.log(chalk.green("Printing Env Variables ...."));
console.log(Environment);
console.log("............")
server.listen(port, err => {
    if (err) {
        return console.error(err);
    }
    else{
    	open(`http://localhost:${port}`);
		}
    console.log(chalk.green(`Server running on http://localhost:${port} [${env}]`));
});
