#!/bin/ruby

# vimのマーク機能を補助するスクリプト
# viminfo形式のマークリストを標準出力する。
#
# INPUT:
#   filename: マークアップの元となるTSVファイル
#     <MARK> <Regexp> <Filename>
#
# 処理：
#   Filename & Regexp でシステムのgrepコマンドを実行。
#   最初に見つかった１行目の行数を用いて、viminfoフォーマットの行を出力する。
#   grepに引っかからない場合、何も出力しない。
#   入力行がフォーマット外だった場合、標準エラー出力に残し、処理を継続する。
#

default_file = "#{ENV['HOME']}/._vim_marks"
lines = []

if File.pipe?(STDIN) || File.select([STDIN], [], [], 0) != nil
  lines = STDIN.readlines
else
  lines = File.readlines(ARGV[0] || default_file)
end

lines.each.with_index(1) do |line, i|
  begin
    next unless line.gsub(/#.*/, "").strip.split(/\t+/).length == 3
    mark, reg, file = line.gsub(/#.*/, "").strip.split(/\t+/)
    line = `grep -m 1 -n '#{reg}' #{file} | cut -d":" -f 1`.strip.to_i
    next if line == 0
    puts "'#{mark} #{line} 0 #{file}"
  rescue => e
    STDERR.puts e
    STDERR.puts "LINE #{i} is Error: #{line}"
  end
end

