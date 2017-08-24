import React, {Component, PropTypes} from 'react';
import { withRouter } from 'react-router'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import ReactQuill from 'react-quill';

import constants from "../../utils/constants";

class EditNewsItem extends Component {

    constructor(props){
        super(props);
        this.state = {
            title: props.newsItem.title,
            content: props.newsItem.content,
            contentHTML: props.newsItem.contentHTML,
            defaultItems: constants.defaultItems
        }
    }

    render() {
        return (
            <div className="container-fluid">
                <form>
                    <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input type="text" value={this.state.title} onChange={this.onTitleChange.bind(this)} className="form-control" id="title" placeholder="Title"/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="content">Content</label>
                        <ReactQuill
                            theme='snow'
                            ref={(input) => { this.textInput = input; }}
                            defaultValue={this.state.contentHTML}
                            toolbar={this.state.defaultItems}
                            onChange={this.onContentChange.bind(this)}
                            style={{height: '900px',border: '2px solid black'}}
                        />
                    </div>
                    <a type="button" style={{marginRight: 10}} className="btn btn-default" onClick={this.handleSave.bind(this)}>Save</a>
                    <a type="button" className="btn btn-danger" onClick={this.handleDelete.bind(this)}>Delete</a>
                </form>
            </div>
        );
    }

    onTitleChange(e){
        this.setState({
            title: e.target.value
        })
    }

    onContentChange(value){
        this.setState({
            contentHTML: value
        })
    }

    handleSave(e){
        e.preventDefault();
        const {id} = this.props.newsItem;
        const {title, contentHTML} = this.state;
        const content = this.textInput.getEditor().getText();
        this.props.editNewsItem({variables: {id, title, content, contentHTML}})
            .then((test) => {
                this.props.router.replace('/')
            })
    }

    handleDelete(e){
        e.preventDefault();
        const {id} = this.props.newsItem;

        this.props.deleteNewsItem({variables: {id}})
            .then((test) => {
                this.props.router.replace('/')
            })
    }
}

const editNewsItem = gql`
  mutation updateNewsItem($id: ID!, $title: String!, $content: String!, $contentHTML: String!) {
    updateNewsItem(id: $id, title: $title, content: $content, contentHTML: $contentHTML) {
      id
      title
      content
      contentHTML
    }
  }
`

const deleteNewsItem = gql`
  mutation deleteNewsItem($id: ID!) {
    deleteNewsItem(id: $id) {
      id
    }
  }`



const EditNewsItemWithMutations =  graphql(deleteNewsItem, {name : 'deleteNewsItem'})(
    graphql(editNewsItem, {name: 'editNewsItem'})(withRouter(EditNewsItem))
)

export default EditNewsItemWithMutations;
