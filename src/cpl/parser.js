


/*
expression = {
    type: number|distance|degree|time|vector|invoke|string
    value: <type specific>,
    mode: rel|abs (only for vector and degree),
    pos: number,
    posEnd: number,
}
what value is:
number: a number
distance: a number in meters
degree: number in degrees
time: time in milliseconds
vector: [number in meters, number in meters]
invoke: { ident: string, arguments: [expression] }
string: the string value

*/



// returns a list of expression
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

// takes in a sting, like "52m", returns distance in meters
function distanceStringToMeters(str) {
    let baseValue = parseFloat(str) // postfix text is just ignored LOL
    if(str.endsWith("m")); // do nothing
    if(str.endsWith("cm")) baseValue /= 100; // convert to m
    if(str.endsWith("ft")) baseValue /= 3.281;
    if(str.endsWith("in")) baseValue /= 39.37;
    return baseValue
}
// parses a single expression, removes those tokens from the token list
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