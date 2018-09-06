import { nodeTpl } from './src/tpl'

function tpl(template) {
    console.log(template)
    console.log(arguments)
}

let content = tpl`Hello ${1} tpl ${2}`;


let aa = (a) => (e) => {
    console.log(a, e)
}
let bb = () => [`<span style="color:orange;">模板嵌套</span>`, `<span style="color:red;">事件绑定</span>`]
let cc = () => [nodeTpl`<div ${{ click: aa(123) }} class='ok'>222</div>`, nodeTpl`<div ${{ click: aa(456) }} class='ok'>333</div>`];
// 调用
var node = nodeTpl`<h2 ${{ click: aa(123) }} class='ok'>测试${bb()}</h2>${cc()}`;

document.body.appendChild(node)



let aa = (a) => (e) => {
    console.log(a, e)
}
let bb = () => [`<span style="color:orange;">模板嵌套</span>`, `<span style="color:red;">事件绑定</span>`]
let cc = () => [nodeTpl`<div ${{ click: aa(456) }} class='ok'>222</div>`, nodeTpl`<div ${{ click: aa(456) }} class='ok'>333</div>`];
// 调用
var node = nodeTpl`<h2 ${{ click: aa(123) }} class='ok'>测试${bb()}</h2>${cc()}`;

document.body.appendChild(node)

const state = {
    name: "请填写姓名",
    tel: "请填写电话"
}
var form = nodeTpl`<h2>测试表单：</h2>
<form ${{ submit: handleSubmit }}>
    <fieldset><legend>注册</legend>
        <div><label>姓名：<input placeholder="${state.name}" ${{ change: setName }}/></label></div>
        <div><label>电话：<input placeholder="${state.tel}" ${{
        change: (e) => {
            console.log(e.target.value)
            state.tel = e.target.value
            console.log(state)
        }
    }}/></label></div>
        <button type="submit">提交</button>
    </fieldset>
</form>`

function setName(e) {
    console.log(e.target.value)
    state.name = e.target.value
}

function handleSubmit() {
    console.log(state)
    return false;
}

document.body.appendChild(form)

const state2 = {
    txt: "xxx"
}
var form2 = nodeTpl`<h2>测试数据监听：</h2>
        <div><label >姓名：<input placeholder="${state.name}" ${{
        keyup: (e) => {
            state2.txt = e.target.value
        }
    }} /> ${{ fn: (txt) => txt, state: state2, param: 'txt' }}</label></div>
        <div style="color:${{ fn: (txt) => txt, state: state2, param: 'txt' }}">111 ${{
        fn: (txt) => {
            return nodeTpl`<h2>测试表单：${txt}</h2>`
        }, state: state2, param: 'txt'
    }}</div>
        `

document.body.appendChild(form2)