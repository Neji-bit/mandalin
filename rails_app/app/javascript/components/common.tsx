import React from 'react'
import Util from '../logic/util'

////////////////////////////////////////////////////////////////////////////////
//  共通コンポーネント
class IconLogo extends React.Component {
  constructor(props) {
    super(props)
    this.parent = props.parent
    this.ref = React.createRef()
  }
  render() {
    return (
      <div className="iconlogo" ref={this.ref}>
        <a href="https://github.com/Neji-bit/mandalin" target="_blank">
          <img src="http://localhost:3000/assets/mandalin_icon-b8307a350ee162dc6500e3ae6224e9889686a0b7608a6e8a9b4688b34e64e35e.svg" />
          <img src="http://localhost:3000/assets/mandalin_logo-9eea0aef374c3d49951474a74398909171ca4aacfc1153cfdae79db430f4a1e0.svg" />
        </a>
      </div>
    )
  }
  componentDidMount() {
  }
  componentWillUnmount() {
  }
}

export {IconLogo}
