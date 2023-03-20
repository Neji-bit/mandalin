import React from 'react'
import {Map, LargeMap, MiddleMap, SmallMap, Area} from './map'
import {Page} from './page'
import {ToolBox} from './tool'
import {IconLogo} from './common'

class Backboard extends React.Component {
  render() {
    let cls = ""
    if(_data.state.fullscreen) cls="fullscreen"
    return(
      <div
        id="layout_backboard"
        className={`panel ${cls}`}
      >
        <TopPanel />
        <LeftPanel />
        <CenterPanel />
        <RightPanel />
        <BottomPanel />
      </div>
    )
  }
}

class TopPanel extends React.Component {
  render() {
    return(
      <div id="layout_top" className="panel">
        TopPanel
      </div>
    )
  }
}

class LeftPanel extends React.Component {
  render() {
    return(
      <div id="layout_left" className="panel">
        <ToolBox/>
      </div>
    )
  }
}

class CenterPanel extends React.Component {
  render() {
    return(
      <div id="layout_center" className="panel">
        <Map />
      </div>
    )
  }
}

class RightPanel extends React.Component {
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
      <div id="layout_right" className="panel">
        {contents}
      </div>
    )
  }
}

class BottomPanel extends React.Component {
  render() {
    return(
      <div id="layout_bottom" className="panel">
        BottomPanel
        <IconLogo parent={this}/>
      </div>
    )
  }
}

export default Backboard
