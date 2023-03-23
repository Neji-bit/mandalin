import axios from 'axios'
//  アプリのAPI一式を定義。
//  データ読み込み／書き込みは _data を直接触る。
class Api {
  static is_synchronizing = false

  static login = (callback = null) => {
  }

  //  ログアウトしたら、なにはともあれページリロード。
  static logout = (callback = null) => {
    axios.delete(`/users/sign_out`)
    .then(() => {
      location.reload()
    })
  }

  static loadBook = (book_id, callback = null) => {
    if(this.is_synchronizing) throw new Error("Already sync now.");
    this.is_synchronizing = true
    axios.get(`/api/v1/book/${book_id}`)
    .then((data) => {
      window.data.book = JSON.parse(data.data).book
    })
    .finally(() => {
      this.is_synchronizing = false
      if(callback) callback()
    })
  }

  static loadPage = (book_id, page_id, callback = null) => {
    if(this.is_synchronizing) throw new Error("Already sync now.");
    this.is_synchronizing = true
    axios.get(`/api/v1/book/${book_id}/page/${page_id}`)
    .then((data) => {
      console.log(JSON.parse(data.data))
    })
    .finally(() => {
      this.is_synchronizing = false
      if(callback) callback()
    })
  }

  static saveBook = (book_id, callback = null) => {
    let payload = {text: JSON.stringify(_data.book)}
    axios.put(`/api/v1/book/${book_id}`, payload)
    .finally(() => {
      if(callback) callback()
    })
  }

  static savePage = (book_id, page_id, callback = null) => {
    let payload = {text: JSON.stringify(_data.page)}
    axios.put(`/api/v1/book/${book_id}/page/${page_id}`, payload)
    .finally(() => {
      if(callback) callback()
    })
  }
}

export {Api}
