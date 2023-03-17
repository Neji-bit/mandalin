import React from 'react'
import { createRoot } from 'react-dom/client'
import Cell from './components/cell'
import Command from './logic/command'
import Backboard from './components/layout'

function App() {
  return (
    <div>
      <Backboard />
    </div>
  )
}

window.data = {text: "HOGEHOGE"}

const root = document.getElementById('root');
if (!root) {
  throw new Error('No root element');
}
createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

class ItemList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      counter: 0
    };
    const a: string = "hoge"
  }
  render() {
    const items = this.props.items
    return (<ul>{items.map(i => <li>{i}</li>)}</ul>)
  }
}

function init() {
  console.log("Init.")
}
window.onload = init

