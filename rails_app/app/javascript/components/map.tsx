import React from 'react'
import {Cell} from './cell'
import Util from '../logic/util'

class Map extends React.Component {
  constructor(props) {
    super(props)
    _data.react.map = this
    this.parent = props.parent
  }
  render() {
    let content = null
    switch(_data.state.viewMode) {
      case "small":
        content = <SmallMap parent={this} />
        break
      case "middle":
        content = <MiddleMap parent={this} />
        break
      default:
        content = <LargeMap parent={this} />
        break
    }
    return(
      <div
        id="map"
        className={_data.state.selectionMode}
      >
        {content}
      </div>
    )
  }
}

class LargeMap extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
  }
  componentDidMount() {
    //  意図せず付いてしまうテキスト選択を解除する。
    window.getSelection().removeAllRanges()
  }
  render() {
    let areas = []
    Area.area_ids.split("").forEach((id, i) => {
      areas.push(
        <Area
          parent={this}
          area_id={id}
          key={i}
        />
      )
    })
    return(
      <div className="map--large">
        {areas}
      </div>
    )
  }
}

class MiddleMap extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
  }
  render() {
    return(
      <div className="map--middle">
        <Area
          parent={this}
          area_id={_data.state.currentArea.match(/.$/)}
        />
      </div>
    )
  }
}

class SmallMap extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
  }
  render() {
    return(
      <div className="map--small">
        <Cell
          parent={this}
          area_id={_data.state.currentArea.match(/.$/)}
          cell_id={_data.state.currentCell.match(/.$/)}
        />
      </div>
    )
  }
}

class Area extends React.Component {
  static area_ids = "wersdfzxc"
  constructor(props) {
    super(props)
    this.parent = props.parent
    this.id = `area_${this.props.area_id}`
    this.state = {selected: false}
    _data.react[this.id] = this
  }
  clicked = (e) => {
    if(_data.state.selectionMode == "selection--areas") {
      this.setState({selected: !this.state.selected})
    }
  }
  doubleClicked = (e) => {
    _data.state.currentArea = this.id
  }
  render() {
    let cells = []
    Cell.cell_ids.split("").forEach((id, i) => {
      cells.push(
        <Cell
          parent={this}
          area_id={this.props.area_id}
          cell_id={id}
          key={i}
        />
      )
    })
    return(
    <div
      id={this.id}
      className={`area ${this.state.selected ? "selected" : ""}`}
      onClick={this.clicked}
      onDoubleClick={this.doubleClicked}
    >
      {cells}
    </div>)
  }
}

export {Map, LargeMap, MiddleMap, SmallMap, Area}
