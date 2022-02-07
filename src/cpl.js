

// schema for a lexed token
/*
{
    type: string (see docs page),
    content: string,
    row: number,
    col: number,
    pos: number,
    posEnd: number,
}
*/

const table = {    
    time     : /^-?[0-9]+(\.[0-9]+)?(s|ms)/,    
    distance : /^-?[0-9]+(\.[0-9]+)?(m|ft|in|cm)/,
    degree   : /^-?[0-9]+(rel|abs)%/,
    number   : /^-?[0-9]+(\.[0-9]+)?/,
    lparen   : /^\(/,
    rparen   : /^\)/,
    lvector  : /^</,
    rvector  : /^>/,
    comma    : /^,/,
    string   : /^"[^"]*"/,
    keyword  : /^(abs|rel)/,
    ident    : /^[a-zA-Z][a-zA-Z0-9]*/
}

function lex() {
    const lines = document.getElementById("cpl-input").value.split(/\n/);
    const tokens = [];
    let row = 0;
    let pos = -1;
    for(line0 of lines) {
        let line = line0;
        let commentOffset = 0;
        if(line.indexOf("//") > -1) {
            line = line0.substring(0, line0.indexOf("//"));
            commentOffset = line0.substring(line0.indexOf("//")).length;
        }
        let col = 0;
        row++;
        pos++;
        while(line.length > 0) {
            if(line[0] == ' ') {
                col++;
                pos++;
                line = line.substring(1);
                continue;
            }
            let match = null;
            let type = null;
            for(tokenType in table) {
                match = table[tokenType].exec(line);
                type = tokenType;
                if(match != null) break;
            }
            if(match == null) {
                throw "Error on row " + row + " col " + col + ", couldn't find token that matches";
                return null;
            }
            match = match[0]
            const token = {
                type: type,
                content: match,
                row: row,
                col: col,
                pos: pos,
                posEnd: pos + match.length
            }
            col += match.length;
            pos += match.length;
            line = line.substring(match.length);
            tokens.push(token)
        }
        pos += commentOffset;
    }
    return tokens;
}


function parse(tokens) {
    let i = 0;
    const tokenQueue = {
        pop: () => { 
            if(i >= tokens.length) throw Error("Reached end of file while parsing");
            return tokens[i++];
        },
        peek: () => {
            if(i >= tokens.length) throw Error("Reached end of file while parsing");
            return tokens[i];
        }
    }
    const exprs = [];
    while(i < tokens.length) {
        exprs.push(parseE(tokenQueue))
    }
    return exprs;
}

function compileCPL() {
    const errorNode = document.getElementById("error-code");
    try {
        const tokens = lex();
        console.log(tokens)
        const ast = parse(tokens);
        console.log(ast);

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


/*
expression = {
    type: number|distance|degree|time|vector|invoke|string
    value: <type specific>,
    mode: rel|abs (only for vector and degree),
    pos: number,
    posEnd: number,
}

number: a number
distance: a number in meters
degree: number in degrees
time: time in milliseconds
vector: [number in meters, number in meters]
invoke: { ident: string, arguments: [expression] }
string: the string value

*/

function distanceStringToMeters(str) {
    let baseValue = parseFloat(str) // postfix text is just ignored LOL
    if(str.endsWith("m")); // do nothing
    if(str.endsWith("cm")) baseValue /= 100; // convert to m
    if(str.endsWith("ft")) baseValue /= 3.281;
    if(str.endsWith("in")) baseValue /= 39.37;
    return baseValue
}

function parseE(tokens) {
    const top = tokens.pop();
    switch(top.type) {
        case "number":
            return { type: "number", value: parseFloat(top.content),
                     pos: top.pos, posEnd: top.posEnd }
        case "distance":
            return { type: "distance", value: distanceStringToMeters(top.content), 
                     pos: top.pos, posEnd: top.posEnd }
        case "degree":
            return {
                type: "degree", 
                value: parseFloat(top.content), 
                mode: top.content.slice(-4, -1),
                pos: top.pos, posEnd: top.posEnd
            }
        case "time":
            return {
                type: "time",
                value: parseFloat(top.content) * (top.content.endsWith("ms") ? 1 : 1000),
                pos: top.pos, posEnd: top.posEnd
            }
        case "lvector":
            const mode = tokens.pop();
            assertEq("keyword", mode.type, mode);
            const xComponentT = tokens.pop();
            assertEq("distance", xComponentT.type, xComponentT);
            const xComponent = distanceStringToMeters(xComponentT.content);
            let yComponent= 0;
            if(tokens.peek().content === ",") {
                tokens.pop();
                const yComponentT = tokens.pop();
                assertEq("distance", yComponentT.type, yComponentT);
                yComponent = distanceStringToMeters(yComponentT.content)
            }
            assertEq(">", tokens.peek().content, tokens.peek());
            return {
                type: "vector",
                mode: mode.content,
                value: [xComponent, yComponent],
                pos: top.pos,
                posEnd: tokens.pop().posEnd
            }
        case "ident":
            assertEq(tokens.peek().content,"(", tokens.pop());
            const arguments = [];
            while(tokens.peek().type != "rparen") {
                arguments.push(parseE(tokens))
                if(tokens.peek().type == "comma") tokens.pop();
            }
            const endParen = tokens.pop(); // TODO assert )
            return { 
                type: "invoke",
                value: { ident: top.content, arguments: arguments },
                pos: top.pos,
                posEnd: endParen.posEnd };
        case "string":
            return { type: "string", value: top.content.substring(1, top.content.length - 1), 
            pos: top.pos, posEnd: top.posEnd }
    }
    throw Error("Can't parse token on line " + top.row + " column " + top.col + " content\"" + top.content + "\""); 
}

function assertEq(a, b, token) {
    if(a !== b) throw Error("Expected " + b + " but got " + a + " at line " + token.row + 
                            " column " + token.col + " content\"" + token.content + "\""); 
}