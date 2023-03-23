import React from 'react'
import {Util} from '../logic/util'
import {Editor} from './cell'
import {Api} from '../logic/api'

import ReactMarkdown from 'react-markdown';
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

////////////////////////////////////////////////////////////////////////////////
//  ページ
class Page extends React.Component {
  static page_ids = "0123456789abcdef"
  constructor(props) {
    super(props)
    this.parent = props.parent
    this.ref = React.createRef()
    this.id = props.page_id
  }
  click = () => {
    if(_data.state.currentPage != this.id) {
      _data.state.currentPage = this.id
      _data.react.layout_right.forceUpdate()
      Api.loadPage(Util.urlParams().book, _data.state.currentPage.match(/.$/),
        () => {
          _data = dataRefresh()
          _data.react.map.refresh()
        }
      )
    }
  }
  render() {
    return (
      <div
        id={this.id}
        ref={this.ref}
        className={`page ${_data.state.currentPage == this.id ? "current--page" : ""}`}
        onClick={this.click}
      >
        <PageIndex
          parent={this}
          key="1"
        />
        <Editor
          parent={this}
          source={_data[this.id].title}
          role="page--title"
          key="2"
        />
      </div>
    )
  }
  componentDidMount() {
//    Util.toAbs(this.ref.current)
  }
  componentWillUnmount() {
  }
}

class PageIndex extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
    this.ref = React.createRef()
  }
  render() {
    return (
      <div
        ref={this.ref}
        className="page--index"
      >
        {this.parent.id.match(/.$/)}
      </div>
    )
  }
}

export {Page}
