
function initCPLUI() {c
    document.getElementById("compile").onclick = compileCPL;
    document.getElementById("cpl-input").addEventListener("input", compileCPL);
    document.getElementById("show-ast").onclick = function() {
        document.getElementById("ast").hidden = !document.getElementById("ast").hidden;
    }
}

function compileCPL() {
    const errorNode = document.getElementById("error-code");
    try {
        const text = document.getElementById("cpl-input").value;
        const tokens = lex(text);
        console.log("tokens", tokens)
        const ast = parse(tokens);
        console.log("ast", ast);

        const root = document.getElementById("ast");
        root.innerHTML = "";
        for(expr of ast) {
            root.appendChild(renderNode(expr, 1))
        }
        errorNode.innerText = "";
        errorNode.hidden = true;
    } catch(e) {
        console.log(e);
        errorNode.innerText = e;
        errorNode.hidden = false;
    }

}
// create a dom node for the expr and return it
// different classnames added:
//   expr-node               all nodes
//   expr-<type>             the specific type
//   expr-depth-N            the current depth
//   expr-command            a command (UpperCamel)
//   expr-invoke-single-arg  a function with one argument
function renderNode(expr, depth) {
    const node = document.createElement("div")
    node.className = "expr-node expr-" + expr.type;
    switch(expr.type){
        case "number": case "distance":
        case "degree": case "time":
        case "vector": case "string":
            node.classList.add("expr-final");
    }
    switch(expr.type) {
        case "number":
            node.innerText = expr.value;
            break;
        case "string":
            node.innerText = '"' + expr.value + '"';
            break;
        case "distance":
            node.innerText = Math.round(expr.value * 1000)/1000 + "m";
            break;
        case "degree":
            node.innerText = expr.value + expr.mode + "%";
            break;
        case "time":
            node.innerText = expr.value + "ms";
            break;
        case "vector":
            let x = (Math.round(expr.value[0] * 1000)/1000);
            let y = (Math.round(expr.value[1] * 1000)/1000);
            
            node.innerText = "<" + expr.mode + " " + x + ", " + y + ">";
            break;
        case "invoke":
            node.innerText = expr.value.ident;
            for(e of expr.value.arguments) {
                node.appendChild(renderNode(e, depth + 1));
            }
            if(expr.value.arguments.length === 1) {
                node.classList.add("expr-invoke-single-arg")
            }
            const c = expr.value.ident[0]
            if(c === c.toUpperCase()) {
                node.classList.add("expr-command")
            } else {
                node.classList.add("expr-depth-" + depth);
            }
            break;
    }
    node.onclick = e => {
        console.log("clicked on ", expr);
        const n = document.getElementById("cpl-input");
        n.focus();
        n.setSelectionRange(expr.pos, expr.posEnd);
        e.stopImmediatePropagation();
    }
    return node;
}
