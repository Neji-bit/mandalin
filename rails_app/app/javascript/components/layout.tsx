import React from 'react'
import {Map, LargeMap, MiddleMap, SmallMap, Area} from './map'
import {Page} from './page'
import {IconLogo} from './common'

class Backboard extends React.Component {
  render() {
    return(
      <div id="layout--backboard" className="panel">
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
      <div id="layout--top" className="panel">
        TopPanel
      </div>
    )
  }
}

class LeftPanel extends React.Component {
  render() {
    return(
      <div id="layout--left" className="panel">
        LeftPanel
      </div>
    )
  }
}

class CenterPanel extends React.Component {
  render() {
    return(
      <div id="layout--center" className="panel">
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
      <div id="layout--right" className="panel">
        {contents}
      </div>
    )
  }
}

class BottomPanel extends React.Component {
  render() {
    return(
      <div id="layout--bottom" className="panel">
        BottomPanel
        <IconLogo parent={this}/>
      </div>
    )
  }
}

export default Backboard
