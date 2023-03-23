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
          <img src="/mandalin_icon.svg" />
          <img src="/mandalin_logo.svg" />
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
