import React from 'react'
import { withRouter } from 'react-router'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { filter } from 'graphql-anywhere'

import EditNewsItem from './EditNewsItem.jsx';

class NewsItemPage extends React.Component {


  render () {
    if (this.props.data.loading) {
      return (<div>Loading</div>)
    }

    if (this.props.data.error) {
      console.log(this.props.data.error)
      return (<div>An unexpected error occurred</div>)
    }

    const newsItem = this.props.data.NewsItem;

    return (
      <div>
        <EditNewsItem
          newsItem={newsItem}
          handleCancel={this.goBack}
          afterChange={this.goBack} />
      </div>
    )
  }

  goBack()  {
    this.props.router.replace('/')
  }
}

const NewsItemQuery = gql`query NewsItemQuery($id: ID!) {
    NewsItem(id: $id) {
      id
      title
      content
      contentHTML
    }
  }
`

const NewsItemPageWithData = graphql(NewsItemQuery, {
    options: (ownProps) => ({
      variables: {
        id: ownProps.params.newsItemId
      }
    })
  }
)(withRouter(NewsItemPage))

export default NewsItemPageWithData
