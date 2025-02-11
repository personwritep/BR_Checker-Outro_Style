// ==UserScript==
// @name        BR Checker+Outro Style ⭐
// @namespace        http://tampermonkey.net/
// @version        4.8
// @description        Blogの書式整形ツール・文字数カウンター 統合版 「Ctrl+F9」「Shift+F9」
// @author        Ameba blog User
// @match        https://blog.ameba.jp/ucs/entry/srventry*
// @exclude        https://blog.ameba.jp/ucs/entry/srventrylist.do*
// @icon        https://www.google.com/s2/favicons?sz=64&domain=ameblo.jp
// @grant        none
// @updateURL        https://github.com/personwritep/BR_Checker-Outro_Style/raw/main/BR_Checker-Outro_Style.user.js
// @downloadURL        https://github.com/personwritep/BR_Checker-Outro_Style/raw/main/BR_Checker-Outro_Style.user.js
// ==/UserScript==


let retry=0;
let interval=setInterval(wait_target, 100);
function wait_target(){
    retry++;
    if(retry>10){ // リトライ制限 10回 1sec
        clearInterval(interval); }
    let target=document.getElementById('cke_1_contents'); // 監視 target
    if(target){
        clearInterval(interval);
        main(); }}


function main(){
    let help_url='https://ameblo.jp/personwritep/entry-12814150772.html';

    let mode=0; // BR Checker 起動・非起動のフラグ
    let target;
    let editor_iframe;
    let iframe_doc;
    let iframe_body;


    let read_json=localStorage.getItem('Outro Style'); // ローカルストレージ 保存名
    let bcos_set=JSON.parse(read_json); // bcos_set[] はツール設定の配列
    if(!Array.isArray(bcos_set)){
        bcos_set=[1, 1, 1]; }
    let write_json=JSON.stringify(bcos_set);
    localStorage.setItem('Outro Style', write_json); // ローカルストレージ 保存


    target=document.getElementById('cke_1_contents'); // 監視 target
    let monitor=new MutationObserver(catch_key);
    monitor.observe(target, {childList: true}); // ショートカット待受け開始

    catch_key();

    function catch_key(){
        let send;

        editor_iframe=document.querySelector('.cke_wysiwyg_frame');
        if(editor_iframe){ // WYSIWYG表示が実行条件
            iframe_doc=editor_iframe.contentWindow.document;

            if(mode==1){
                sign(); }

            document.addEventListener("keydown", check_key);
            iframe_doc.addEventListener("keydown", check_key);


            function check_key(event){
                let gate=-1;

                if(event.ctrlKey==true){
                    if(event.keyCode==120){
                        event.preventDefault(); send=120; gate=1; }} // ショートカット「Ctrl＋F9」
                if(event.shiftKey==true){
                    if(event.keyCode==120){
                        event.preventDefault(); send=0; gate=1; }} // ショートカット「Shift＋F9」
                if(editor_iframe){
                    if(gate==1){
                        event.stopImmediatePropagation();
                        event.preventDefault();
                        set_task(send); }}}

            before_end(); }} // catch_key


    function set_task(send){
        if(send==120){ //「Ctrl＋F9」 BR Checker
            if(mode==0){
                mode=1;
                sign(); }// BR CheckerをON
            else if(mode==1){
                mode=0;
                sign_clear(); }} // BR CheckerをOFF
        if(send==0){ //「Shift＋F9」 Rewrite  BR Checker + Outer Style
            mode=1;
            sign_clear();
            clear_cotenteditable();
            if(bcos_set[0]==1){
                rewrite();
                if(bcos_set[1]==1){
                    tail_space(); }
                setTimeout(()=>{
                    sign();
                }, 800); }
            else if(bcos_set[0]==0){
                if(bcos_set[1]==1){
                    tail_space(); }
                setTimeout(()=>{
                    sign();
                }, 800); }}
    } // set_task



    // ********** BR Checker  Functions **************

    function sign(){
        let br_tag;
        let br_mark;
        let i_tag;
        let o_tag;
        let c_br=0;
        let c_br_span;
        let c_brrw=0;
        let c_brrw_span;

        let style_if_br= // iframe内の BRのデザインを指定
            '<style id="style_if_br">'+
            '.brm { position: absolute } '+
            'i.brm:before { content: "▼"; color: red; margin-left: -2px; font-style: normal } '+
            'p.brs:before { content: "▼"; color: #008fff; margin-left: -2px; font-style: normal }'+
            '</style>';

        let html_if=iframe_doc.documentElement;
        if(!html_if.querySelector('#style_if_br')){
            html_if.insertAdjacentHTML('beforeend', style_if_br); }

        i_tag=iframe_doc.querySelectorAll('.brm');
        if(i_tag.length >0){
            for(let i=0; i < i_tag.length; i++){ i_tag[i].remove(); }} // BRマーク削除してリセット
        o_tag=iframe_doc.querySelectorAll('.brs'); // 処理時の brshell の処理残りをカウント確認
        if(o_tag.length >0){
            c_brrw=o_tag.length; }
        else{ c_brrw=0; }

        br_tag=iframe_doc.querySelectorAll('br');
        for(let i=0; i < br_tag.length; i++){
            if(br_tag[i].parentNode.tagName=="P" &&
               br_tag[i].parentNode.childNodes.length !=1){
                c_br +=1;
                br_mark=iframe_doc.createElement("i");
                br_mark.appendChild(iframe_doc.createTextNode("")); // 空白文字
                br_mark.setAttribute("class", "brm");
                br_tag[i].parentNode.insertBefore(br_mark, br_tag[i]); }
            else{ continue; }} // BRマーク表示


        let style_bt= // ツールバーのデザインを指定
            '<style id="style_bt">'+
            '#cke_1_contents { display: flex; flex-direction: column; } '+
            '#disp_bt { display: block; margin: 0 0 5px; padding: 4px 0 1px; '+
            'font: 16px/24px Meiryo; color: #fff; background: red; position: relative; '+
            'white-space: nowrap; } '+
            '#help_bcos { position: absolute; top: 7px; left: 6px; height: 16px; width: 16px; '+
            'cursor: pointer; } '+
            '#sw_bc, #sw_os { cursor: pointer; } '+
            '#sp_bc { margin-left: 12px; } '+
            '#sp_os { margin-left: 12px; margin-right: 40px; } '+
            '#add_n { position: absolute; top: 4px; width: 38px; height: 23px; '+
            'font-weight: bold; border: none; box-shadow: none; background: red; } '+
            '#w_count { text-shadow: 0.5px 0 #fff; }'+
            '</style>';

        let SVG_h=
            '<svg id="help_bcos" viewBox="0 0 150 150">'+
            '<path  fill="#fff" d="M66 13C56 15 47 18 39 24C-12 60 18 146 82 137C92 '+
            '135 102 131 110 126C162 90 128 4 66 13M68 25C131 17 145 117 81 '+
            '125C16 133 3 34 68 25M69 40C61 41 39 58 58 61C66 63 73 47 82 57C84 '+
            '60 83 62 81 65C77 70 52 90 76 89C82 89 82 84 86 81C92 76 98 74 100 66'+
            'C105 48 84 37 69 40M70 94C58 99 66 118 78 112C90 107 82 89 70 94z">'+
            '</path></svg>';

        let disp_bt=
            '<div id="disp_bt">'+
            '<a href="'+ help_url +'" target="_blank" rel="noopener noreferrer">'+
            SVG_h +'</a>'+
            '　　 <span id="sw_bc">◼</span> BR Checker<span id="sp_bc">▼count：'+
            '<span style="font-weight: bold">'+ c_br +'</span> / shell：'+
            '<span style="font-weight: bold">'+ c_brrw +'</span></span>'+
            '　　<span id="sw_os">◼</span> Outro Style<span id="sp_os">lines：'+
            '<input id="add_n" type="number" min="0"></span>'+
            ' ◼ W count：<span id="w_count">　</span>'+
            style_bt +
            '</div>';

        monitor.disconnect(); // MutationObserverを BR Checker 起動表示に反応させない

        if(target.querySelector('#disp_bt')){
            target.querySelector('#disp_bt').remove();
            target.insertAdjacentHTML('afterbegin', disp_bt); }
        else{
            target.insertAdjacentHTML('afterbegin', disp_bt); }

        monitor.observe(target, {childList: true}); // BR Checker 起動表示

        set_sw_bc();
        set_sw_os();
        set_lines();
        counter(); } // sign()


    function set_sw_bc(){
        let sw_bc=document.querySelector('#sw_bc');
        let sp_bc=document.querySelector('#sp_bc');
        if(bcos_set[0]==1){
            sw_bc.innerHTML='◼';
            sp_bc.style.opacity='1'; }
        else{
            sw_bc.innerHTML='◻';
            sp_bc.style.opacity='0.5'; }
        sw_bc.onclick=function(){
            if(bcos_set[0]==1){
                sw_bc.innerHTML='◻';
                sp_bc.style.opacity='0.5';
                bcos_set[0]=0; }
            else{
                sw_bc.innerHTML='◼';
                sp_bc.style.opacity='1';
                bcos_set[0]=1; }
            let write_json=JSON.stringify(bcos_set);
            localStorage.setItem('Outro Style', write_json); }}


    function set_sw_os(){
        let sw_os=document.querySelector('#sw_os');
        let sp_os=document.querySelector('#sp_os');
        if(bcos_set[1]==1){
            sw_os.innerHTML='◼';
            sp_os.style.opacity='1'; }
        else{
            sw_os.innerHTML='◻';
            sp_os.style.opacity='0.5'; }
        sw_os.onclick=function(){
            if(bcos_set[1]==1){
                sw_os.innerHTML='◻';
                sp_os.style.opacity='0.5';
                bcos_set[1]=0; }
            else{
                sw_os.innerHTML='◼';
                sp_os.style.opacity='1';
                bcos_set[1]=1; }
            let write_json=JSON.stringify(bcos_set);
            localStorage.setItem('Outro Style', write_json); }}


    function set_lines(){
        let add_n=document.querySelector('#add_n');
        if(add_n){
            add_n.value=bcos_set[2]; // bcos_set[2] 「空白行」のストレージ値
            add_n.addEventListener('input', function(event){
                event.preventDefault();
                bcos_set[2]=Number(add_n.value);
                let write_json=JSON.stringify(bcos_set);
                localStorage.setItem('Outro Style', write_json); }); }} // ローカルストレージ 保存


    function sign_clear(){
        let i_tag;

        editor_iframe=document.querySelector('.cke_wysiwyg_frame');
        iframe_doc=editor_iframe.contentWindow.document;

        if(target.querySelector('#disp_bt')){
            target.querySelector('#disp_bt').remove(); } // BR Checker 起動表示を削除

        i_tag=iframe_doc.querySelectorAll('.brm');
        if(i_tag.length >0){
            for(let i=0; i < i_tag.length; i++){ i_tag[i].remove(); }}} // BRマーク削除



    // ********** BR Rewrite  Functions **************

    function rewrite(){
        let br_tag;
        let br_rewrite;
        let o_tag;
        let native_line;

        first_rw(go_back);

        function first_rw(){
            let wysiwyg=iframe_doc.querySelector('html');
            native_line=wysiwyg.scrollTop; // 通常表示のスクロール位置を記録

            br_tag=iframe_doc.querySelectorAll('br');
            for(let i=0; i < br_tag.length; i++){
                if(br_tag[i].parentNode.tagName=="P" && br_tag[i].parentNode.childNodes.length !=1){
                    br_rewrite=iframe_doc.createElement("p");
                    br_rewrite.appendChild(iframe_doc.createTextNode(""));
                    br_rewrite.setAttribute("class", "brs");
                    br_tag[i].parentNode.replaceChild(br_rewrite, br_tag[i]); }}

            go_back(); }


        function go_back(){
            document.querySelector('button[data-mode="source"]').click(); // HTML表示に移動

            let interval0=setInterval(find_mirror, 10);
            function find_mirror(){
                let CodeMirror=document.querySelector('.CodeMirror');
                if(CodeMirror){
                    clearInterval(interval0);
                    document.querySelector('button[data-mode="wysiwyg"]').click();
                    go_back2(); }}}

        function go_back2(){
            let interval1=setInterval(find_iframe, 10);
            function find_iframe(){
                let editor_iframe=document.querySelector('.cke_wysiwyg_frame');
                if(editor_iframe){
                    iframe_doc=editor_iframe.contentWindow.document;
                    if(iframe_doc){
                        clearInterval(interval1);
                        setTimeout( function(){
                            second_rw(); }, 400); }}}}

        function second_rw(){
            o_tag=iframe_doc.querySelectorAll('.brs');
            if(o_tag.length >0){
                for(let i=0; i < o_tag.length; i++){
                    if(o_tag[i].nextElementSibling==o_tag[i+1] ){
                        o_tag[i].classList.remove('brs'); } // 2連 .brs 生成の場合は先頭側class名を削除
                    else{
                        o_tag[i].remove(); }}} // 単体の .brs の場合は削除（上の後方側も含む）

            let wysiwyg=iframe_doc.querySelector('html');
            wysiwyg.scrollTop=native_line; }} // 記録された通常表示のスクロール位置に移動



    // ********** Before End Functions **************

    function before_end(){
        let submitButton=document.querySelectorAll('.js-submitButton');
        if(editor_iframe !=null){ //「通常表示」編集画面が実行条件
            submitButton[0].addEventListener("mousedown", all_clear, false);
            submitButton[1].addEventListener("mousedown", all_clear, false); }

        function all_clear(event){
            let o_tag=iframe_doc.querySelectorAll('.brs'); // 処理時の brshell の処理残りをカウント確認
            if(o_tag.length >0){
                alert("⛔　BR削除処理が不完全です 　BR-Shell数：" + o_tag.length +"\n\n" +
                      "　　　BR削除「Ctrl + F9」　を再実行してください");
                event.stopImmediatePropagation();
                event.preventDefault(); }
            else{
                let i_tag;
                editor_iframe=document.querySelector('.cke_wysiwyg_frame');
                iframe_doc=editor_iframe.contentWindow.document;
                i_tag=iframe_doc.querySelectorAll('.brm');
                if(i_tag.length >=1){
                    for(let i=0; i < i_tag.length; i++){ i_tag[i].remove(); }}}}} // マーク削除



    // ********** Img "Contenteditable" Rewrite  Functions ***********

    function clear_cotenteditable(){ // imgの「contenteditable="inherit"」属性を削除
        editor_iframe=document.querySelector('.cke_wysiwyg_frame');
        iframe_doc=editor_iframe.contentWindow.document;
        if(iframe_doc){
            let img=iframe_doc.querySelectorAll('img[contenteditable="inherit"]');
            for(let k=0; k<img.length; k++){
                img[k].removeAttribute('contenteditable'); }}}



    // ********** Tail Space **************

    function tail_space(){
        let retry=0;
        let interval=setInterval(wait_target, 400);
        function wait_target(){
            retry++;
            if(retry>10){ // リトライ制限 10回 4sec
                clearInterval(interval); }

            editor_iframe=document.querySelector('.cke_wysiwyg_frame');
            if(editor_iframe){
                iframe_doc=editor_iframe.contentWindow.document;
                if(iframe_doc){
                    iframe_body=iframe_doc.querySelector('.cke_editable'); // 待機 target
                    if(iframe_body){
                        clearInterval(interval);
                        tail_sp(); }}}}}


    function tail_sp(){
        editor_iframe=document.querySelector('.cke_wysiwyg_frame');
        iframe_doc=editor_iframe.contentWindow.document;
        if(iframe_doc){ //「通常表示」が動作条件
            iframe_body=iframe_doc.querySelector('.cke_editable');
            if(iframe_body){
                let chiled_tag=iframe_doc.querySelectorAll('.cke_editable >*');
                for(let k=chiled_tag.length-1; k>=0; k--){
                    if(chiled_tag[k].tagName!="STYLE"){
                        if(chiled_tag[k].tagName=="P" && chiled_tag[k].childNodes.length==1){
                            if(chiled_tag[k].childNodes[0].tagName=="BR"){
                                chiled_tag[k].remove(); }
                            else if(chiled_tag[k].childNodes[0].tagName=="STYLE"){
                                iframe_body.insertBefore(chiled_tag[k].childNodes[0], chiled_tag[k]);
                                chiled_tag[k].remove(); }
                            else{
                                break; }}
                        else if(chiled_tag[k].tagName=="DIV" && chiled_tag[k].childNodes.length==1){
                            if(chiled_tag[k].childNodes[0].tagName=="BR"){
                                chiled_tag[k].remove(); }
                            else{
                                break; }}
                        else{
                            break; }}}

                add_line(); // ストレージ値の「空白行」を本文末尾に追加
                counter();

                function add_line(){
                    for(let k=0; k<bcos_set[2]; k++){ // bcos_set[2] は「空白行」のストレージ値
                        add_nextline(); }
                    function add_nextline(){
                        let insert_node=iframe_doc.createElement('P');
                        insert_node.appendChild(iframe_doc.createElement('BR'));
                        let asa=iframe_body.querySelector('.asa');
                        if(asa){
                            iframe_body.insertBefore(insert_node, asa); }
                        else{
                            iframe_body.appendChild(insert_node); }}}}}}



    // ********** Editor Counter **************

    function counter(){
        let retry=0;
        let interval=setInterval(wait_target, 400);
        function wait_target(){
            retry++;
            if(retry>10){ // リトライ制限 10回 4sec
                clearInterval(interval); }

            editor_iframe=document.querySelector('.cke_wysiwyg_frame');
            if(editor_iframe){
                iframe_doc=editor_iframe.contentWindow.document;
                if(iframe_doc){
                    iframe_body=iframe_doc.querySelector('.cke_editable'); // 待機 target
                    if(iframe_body){
                        clearInterval(interval);
                        w_ct(); }}}}}


    function w_ct(){
        let html_source;
        let count_display;
        let chr_count;

        iframe_doc=editor_iframe.contentWindow.document;
        if(iframe_doc){ //「通常表示」が動作条件
            iframe_body=iframe_doc.querySelector('.cke_editable');

            iframe_body.querySelectorAll('a').forEach((link) => {
                link.removeAttribute('data-cke-saved-href'); }); //「a要素」の「data-cke-saved」補正

            iframe_body.querySelectorAll('img').forEach((link) => {
                link.removeAttribute('data-cke-saved-src'); }); //「img要素」の「data-cke-saved」補正

            html_source=iframe_body.innerHTML; // HTMLソースコードを取得
            chr_count=get_count(html_source);

            function get_count(str){
                let result=0;
                for(let i=0; i<str.length; i++){
                    let chr=str.charCodeAt(i);
                    if((chr>=0x00 && chr<0x81) || (chr===0xf8f0) ||
                       (chr>=0xff61 && chr<0xffa0) || (chr>=0xf8f1 && chr<0xf8f4)){
                        result += 1; } //半角文字の場合は1を加算
                    else{
                        result += 2; }} //それ以外の文字の場合は2を加算
                return result; }


            // 以下は、挿入要素ごとの補正
            let blockquote_tag=iframe_body.querySelectorAll('blockquote');
            let div_tag=iframe_body.querySelectorAll('div');
            let p_tag=iframe_body.querySelectorAll('p');
            let h2_tag=iframe_body.querySelectorAll('h2');
            let h3_tag=iframe_body.querySelectorAll('h3');
            let h4_tag=iframe_body.querySelectorAll('h4');
            let ul_tag=iframe_body.querySelectorAll('ul');
            let ol_tag=iframe_body.querySelectorAll('ol');
            let li_tag=iframe_body.querySelectorAll('li');
            let pre_tag=iframe_body.querySelectorAll('pre');
            let br_tag=iframe_body.querySelectorAll('br');
            let iframe_tag=iframe_body.querySelectorAll('iframe');
            let table_tag=iframe_body.querySelectorAll('table');
            let tr_tag=iframe_body.querySelectorAll('tr');
            let td_tag=iframe_body.querySelectorAll('td');
            let style_tag=iframe_body.querySelectorAll('style');

            let correct=
                6*blockquote_tag.length +
                2*div_tag.length +
                2*p_tag.length +
                2*h2_tag.length +
                2*h3_tag.length +
                2*h4_tag.length +
                6*ul_tag.length +
                6*ol_tag.length +
                3*li_tag.length +
                6*pre_tag.length +
                2*br_tag.length +
                2*iframe_tag.length +
                12*table_tag.length +
                8*tr_tag.length +
                5*td_tag.length +
                6*style_tag.length;


            let wordcount=document.querySelector('.cke_wordcount');
            wordcount.style.margin="9px 20px 0 0";
            wordcount.style.padding="0 10px";
            let path_item=document.querySelector('.cke_path_item');
            path_item.style.font="normal 14px Meiryo";
            path_item.style.color="#000";
            let real_count=document.createElement("span");
            real_count.setAttribute("class", "real_count");
            real_count.style.font="normal 14px Meiryo";
            real_count.style.color="#000";
            if(wordcount.querySelector('.real_count')){
                wordcount.querySelector('.real_count').remove(); }
            wordcount.appendChild(real_count);

            real_count.innerHTML='　半角: ' + (chr_count+correct); // 画面表示

            let w_count=document.querySelector('#w_count');
            if(w_count){
                w_count.innerHTML=(chr_count+correct).toString(); } // メニューバー表示
        }}

} // main()
