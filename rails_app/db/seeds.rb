# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: "Star Wars" }, { name: "Lord of the Rings" }])
#   Character.create(name: "Luke", movie: movies.first)

# ユーザーの作成。
# メーラーが使えない間は skip_confirmation! で凌ぐ。
# TODO: メーラー導入後は普通にメール認証を通すように修正する。
# 
# パスワードは未定義（＝このままでは絶対に入れない）。
# メーラーが使えない間は、コンソールからパスワードを設定する。
# TODO: メーラー導入後は画面からパスワード再設定。
user_me  = User.new({email: "me@example.com"})
user_me.skip_confirmation!
user_me.save(validate: false)
user_who = User.new({email: "who@example.com"})
user_who.skip_confirmation!
user_who.save(validate: false)

