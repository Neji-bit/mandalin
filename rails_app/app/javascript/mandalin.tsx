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

window.data = {
  text: "HOGEHOGE",
  //  text: "H  \nO  \nG  \nE  \nH  \nO  \nG  \nE  \nH  \nO  \nG  \nE  \nH  \nO  \nG  \nE  \n",
  book: {
    title: "BOOK_TITLE",
    pages: {
      page_0: { title: { effect: "", data: "PAGE_0", }, },
      page_1: { title: { effect: "", data: "PAGE_1", }, },
      page_2: { title: { effect: "", data: "PAGE_2", }, },
      page_3: { title: { effect: "", data: "PAGE_3", }, },
      page_4: { title: { effect: "", data: "PAGE_4", }, },
      page_5: { title: { effect: "", data: "PAGE_5", }, },
      page_6: { title: { effect: "", data: "PAGE_6", }, },
      page_7: { title: { effect: "", data: "PAGE_7", }, },
      page_8: { title: { effect: "", data: "PAGE_8", }, },
      page_9: { title: { effect: "", data: "PAGE_9", }, },
      page_a: { title: { effect: "", data: "PAGE_a", }, },
      page_b: { title: { effect: "", data: "PAGE_b", }, },
      page_c: { title: { effect: "", data: "PAGE_c", }, },
      page_d: { title: { effect: "", data: "PAGE_d", }, },
      page_e: { title: { effect: "", data: "PAGE_e", }, },
      page_f: { title: { effect: "", data: "PAGE_f", }, },
    },
    state: {
      currentPage: "page_0",
      currentArea: "area_w",
      currentCell: "cell_ww",
    },
  },
  page: {
    id: "page_0",
    title: "## PAGE_0 ##",
    areas: {
      area_w: {
        cells: {
          cell_ww: { subject: { effect: "", data: "ww_SUBJECT", }, note: { effect: "", data: "ww_NOTE", } },
          cell_we: { subject: { effect: "", data: "we_SUBJECT", }, note: { effect: "", data: "we_NOTE", } },
          cell_wr: { subject: { effect: "", data: "wr_SUBJECT", }, note: { effect: "", data: "wr_NOTE", } },
          cell_ws: { subject: { effect: "", data: "ws_SUBJECT", }, note: { effect: "", data: "ws_NOTE", } },
          cell_wd: { subject: { effect: "", data: "wd_SUBJECT", }, note: { effect: "", data: "wd_NOTE", } },
          cell_wf: { subject: { effect: "", data: "wf_SUBJECT", }, note: { effect: "", data: "wf_NOTE", } },
          cell_wz: { subject: { effect: "", data: "wz_SUBJECT", }, note: { effect: "", data: "wz_NOTE", } },
          cell_wx: { subject: { effect: "", data: "wx_SUBJECT", }, note: { effect: "", data: "wx_NOTE", } },
          cell_wc: { subject: { effect: "", data: "wc_SUBJECT", }, note: { effect: "", data: "wc_NOTE", } },
        },
      },
    },
  },
}
let arrows = "wersdfzxc"
arrows.split("").forEach((a) => {
  window.data.page.areas[`area_${a}`] = {cells: {}}
  let cells = window.data.page.areas[`area_${a}`].cells
  arrows.split("").forEach((c) => {
    cells[`cell_${a}${c}`] = { subject: { effect: "", data: `${a}${c}_SUBJECT`, }, note: { effect: "", data: `${a}${c}_NOTE`, } }
  })
})

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

