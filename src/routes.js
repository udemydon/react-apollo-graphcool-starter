/**
 * Created by gopi on 1/8/17.
 */
import React from 'react'
import { Route, IndexRoute } from 'react-router'
import Layout from './components/Layout';
import IndexPage from './components/IndexPage';
import NotFoundPage from './components/NotFoundPage';
import AddNewsItem from './components/news/AddNewsItem.jsx';
import NewsItemPage from './components/news/NewsItemPage.jsx';

const routes = (
    <Route path="/" component={Layout}>
        <IndexRoute component={IndexPage}/>
        <Route path="addNewsItem" component={AddNewsItem}/>
        <Route path="newsItem/:newsItemId" component={NewsItemPage}/>
        <Route path="*" component={NotFoundPage}/>
    </Route>
);

export default routes;
