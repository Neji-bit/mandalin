import React from 'react'
import Util from '../logic/util'
import {Editor} from './cell'

import ReactMarkdown from 'react-markdown';
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

////////////////////////////////////////////////////////////////////////////////
//  ページ
class Page extends React.Component {
  static cell_ids = "wersdfzxc"
  constructor(props) {
    super(props)
    this.parent = props.parent
    this.ref = React.createRef()
  }
  render() {
    return (
      <div
        ref={this.ref}
        className="page"
      >
        <PageIndex key="1" />
        <Editor key="2" />
      </div>
    )
  }
  componentDidMount() {
    Util.toAbs(this.ref.current)
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
      <div ref={this.ref}
        className="page--index"
      >
        0
      </div>
    )
  }
}

export {Page}
