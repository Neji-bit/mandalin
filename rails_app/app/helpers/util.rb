# 開発作業用の便利コマンド群。
class Util
  class << self
    # DB上のブックをリストアップする。最終更新日で降順。
    def books
      Book.eager_load(:pages).sort_by(&:updated_at).reverse.map{|b|
        json = JSON.parse(b.text)
        [b.id, b.name, json["title"], b.pages.count, b.updated_at.in_time_zone("Tokyo").to_s]
      }
    end

    # ブックを複製する。
    # ページもコピーする。
    def copyBook(book, altName)
      b = book.dup
      b.name = altName
      ActiveRecord::Base.transaction do
        b.save
        book.pages.each do |page|
          _p = page.dup
          _p.book = b
          _p.save
        end
      end
    end
  end
end
