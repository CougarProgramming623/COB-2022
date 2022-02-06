

// schema for a lexed token
/*
{
    type: string (see docs page),
    content: string,
    row: number,
    col: number
}
*/

const table = {
    distance : /^-?[0-9]+(\.[0-9]+)?(m|ft|in|cm)/,
    degree   : /^-?[0-9]+(rel|abs)%/,
    time     : /^-?[0-9]+(\.[0-9]+)?(s|ms)/,    
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
    for(line0 of lines) {
        let line = line0;
        let col = 0;
        row++;
        while(line.length > 0) {
            if(line[0] == ' ') {
                col++; line = line.substring(1); continue;
            }
            let match = null;
            let type = null;
            for(tokenType in table) {
                match = table[tokenType].exec(line);
                type = tokenType;
                if(match != null) break;
            }
            if(match == null) {
                alert("Error on row " + row + " col " + col + ", couldn't find token that matches");
                return null;
            }
            match = match[0]
            const token = {
                type: type,
                content: match,
                row: row,
                col: col
            }
            col += match.length;
            line = line.substring(match.length);
            tokens.push(token)
        }
    }
    return tokens;
}


function parse(tokens) {
    let i = 0;
    const tokenQueue = {
        pop: () => { return tokens[i++]; },
        peek: () => { return tokens[i]; }
    }
    const exprs = [];
    while(i < tokens.length) {
        exprs.push(parseE(tokenQueue))
    }
    return exprs;
}
function compileCPL() {
    console.log(parse(lex()));
}
/*
{
    type: number|distance|degree|time|vector|invoke
    value: <type specific>,
    mode: rel|abs (only for vector and degree)
}


number: a number
distance: a number in meters
degree: number in degrees
time: time in milliseconds
vector: [number in meters, number in meters]
invoke: { ident: string, arguments: [expression] }


*/

function distanceStringToMeters(str) {
    let baseValue = parseInt(str) // postfix text is just ignored LOL
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
            return { type: "number", value: parseInt(top.content) }
        case "distance":
            return { type: "distance", value: distanceStringToMeters(top.content) }
        case "degree":
            return {
                type: "degree", 
                value: parseInt(top.content), 
                mode: top.content.slice(-4, -1)
            }
        case "time":
            return {
                type: "time",
                value: parseInt(top.content) * (top.content.endsWith("s") ? 1000 : 1)
            }
        case "lvector":
            const mode = tokens.pop();
            assertEq("keyword", mode.type);
            const xComponentT = tokens.pop();
            assertEq("distance", xComponentT.type);
            const xComponent = distanceStringToMeters(xComponentT.content);
            let yComponent= 0;
            if(tokens.peek().content === ",") {
                tokens.pop();
                const yComponentT = tokens.pop();
                assertEq("distance", yComponentT.type);
                yComponent = distanceStringToMeters(yComponentT.content)
            }
            assertEq(">", tokens.pop().content);
            return {
                type: "vector",
                mode: mode.content,
                value: [xComponent, yComponent]
            }
        case "ident":
            assertEq("(", tokens.pop().content);
            const arguments = [];
            while(tokens.peek().type != "rparen") {
                arguments.push(parseE(tokens))
                if(tokens.peek().type == "comma") tokens.pop();
            }
            tokens.pop();
            return { type: "invoke", value: { ident: top.content, arguments: arguments }}
    }
    throw "Can't parse token '" + JSON.stringify(top) + "'"
}

function assertEq(a, b) {
    if(a !== b) throw "Expected " + b + " but got " + a; 
}