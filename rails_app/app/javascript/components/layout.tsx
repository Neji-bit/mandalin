import React from 'react'
import {Map, LargeMap, MiddleMap, SmallMap, Area} from './map'
import {Page} from './page'
import {ToolBox} from './tool'
import {IconLogo} from './common'
import {Editor} from './cell'

class Backboard extends React.Component {
  render() {
    let cls = ""
    if(_data.state.fullscreen) cls="fullscreen"
    return(
      <div
        id="layout_backboard"
        className={`panel ${cls}`}
      >
        <TopPanel parent={this}/>
        <LeftPanel parent={this}/>
        <CenterPanel parent={this}/>
        <RightPanel parent={this}/>
        <BottomPanel parent={this}/>
      </div>
    )
  }
}

class TopPanel extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
    this.id = "layout_top"
    _data.react[this.id] = this
  }
  render() {
    return(
      <div id={this.id} className="panel">
        <div
          key="1"
        >
        </div>
        <Editor
          parent={this}
          role="book--title"
          source={_data.book.title}
          key="2"
        />
        <div
          className="accounts"
          key="3"
        >
          <div
            className="status"
          >
            ReadOnly
          </div>
          <div
            className="email"
          >
            me@example.com
          </div>
          <div
            className="switch"
          >
            <button>
              LogOut
            </button>
          </div>
        </div>
      </div>
    )
  }
}

class LeftPanel extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
    this.id = "layout_left"
    _data.react[this.id] = this
  }
  render() {
    return(
      <div id={this.id} className="panel">
        <ToolBox/>
      </div>
    )
  }
}

class CenterPanel extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
    this.id = "layout_center"
    _data.react[this.id] = this
  }
  render() {
    return(
      <div id={this.id} className="panel">
        <Map />
      </div>
    )
  }
}

class RightPanel extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
    this.id = "layout_right"
    _data.react[this.id] = this
  }
  render() {
    let contents = []
    Page.page_ids.split("").forEach((i, n) => {
      contents.push(
        <Page
          page_id={`page_${i}`}
          parent={this}
          className="page"
          key={n}
        />)
    })
    return(
      <div id={this.id} className="panel">
        <div
          className="page--list"
        >
          <div
            className="label"
          >
            PageList
          </div>
          {contents}
        </div>
      </div>
    )
  }
}

class BottomPanel extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
    this.id = "layout_bottom"
    _data.react[this.id] = this
  }
  render() {
    return(
      <div id={this.id} className="panel">
        <IconLogo parent={this}/>
      </div>
    )
  }
}

export default Backboard
