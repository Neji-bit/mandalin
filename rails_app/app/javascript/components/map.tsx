import React from 'react'
import {Cell} from './cell'
import Util from '../logic/util'

class Map extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
    this.state = {mode: "large"}
  }
  zoom = () => {
    let modes = ["large", "middle", "small"]
    let index = modes.indexOf(this.state.mode)
    index = (index + 1) % modes.length
    this.setState({mode: modes[index]})
  }
  render() {
    let content = null
    switch(this.state.mode) {
      case "large":
        content = <LargeMap parent={this} />
        break
      case "middle":
        content = <MiddleMap parent={this} />
        break
      default:
        content = <SmallMap parent={this} />
        break
    }
    return(
      <div id="map" onDoubleClick={this.zoom}>
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
      className="area"
      onDoubleClick={this.doubleClicked}
    >
      {cells}
    </div>)
  }
}

export {Map, LargeMap, MiddleMap, SmallMap, Area}
