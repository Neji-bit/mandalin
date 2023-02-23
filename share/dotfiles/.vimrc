" 定番設定
:set hidden
:set nowrap
:set nu

" 文字コード指定
:set enc=UTF-8

" タブ設定
:set shiftwidth=2
:set tabstop=2
:set expandtab

" コードのインデント設定
:set smartindent

" vimにステータス行を表示する
:set laststatus=2
:set statusline=%F%m%h%w\ %<[ENC=%{&fenc!=''?&fenc:&enc}]\ [FMT=%{&ff}]\ [TYPE=%Y]\ %=[CODE=0x%02B]\ [POS=%l/%L(%02v)]

" 再度ファイルを開いた時、カーソルの位置を記憶しておく
if has("autocmd")
au BufReadPost * if line("'\"") > 1 && line("'\"") <= line("$") | exe "normal! g`\"" | endif
endif

" 独自定義。専用に切り出した上書き用viminfoを読み込む。Mark位置を切り出した形。
command MarkFile vsplit ~/._vim_marks
command Marks call Marks_()
function Marks_()
  !vim_marks.rb > ~/._viminfo_marks 2>/dev/null
  rv! ~/._viminfo_marks
endfunction

