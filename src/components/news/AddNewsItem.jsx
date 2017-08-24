import React, {Component, PropTypes} from 'react';
import { withRouter } from 'react-router'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import ReactQuill from 'react-quill';
import constants from "../../utils/constants";



class AddNewsItem extends Component {

    constructor(props){
        super(props);
        this.state = {
            title: "",
            contentHTML: "",
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
                            defaultValue={""}
                            toolbar={this.state.defaultItems}
                            onChange={this.onContentChange.bind(this)}
                            style={{height: '900px',border: '2px solid black'}}
                        />
                    </div>
                    <a type="button" className="btn btn-default" onClick={this.handleSave.bind(this)}>Submit</a>
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
        const {title, contentHTML} = this.state
        const content = this.textInput.getEditor().getText();
        this.props.mutate({variables: {title, content, contentHTML}})
            .then((res) => {
                console.log("Send Push Notif", res.data);
                fetch('sendNotification', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: res.data.createNewsItem.id,
                        title: res.data.createNewsItem.title
                    }),
                }).then((res) => {
                    console.log("Fetch Resp:", res)
                }).catch((err) => {
                    console.log("Fetch err", err)
                });
                this.props.router.replace('/')
            })
    }
}

const createNewsItemMutation = gql`
  mutation createNewsItem($title: String!, $content: String!, $contentHTML: String!) {
    createNewsItem(title: $title, content: $content, contentHTML: $contentHTML ) {
      id
      title
    }
  }
`

const AddNewsItemWithMutation = graphql(createNewsItemMutation)(withRouter(AddNewsItem))

export default AddNewsItemWithMutation;