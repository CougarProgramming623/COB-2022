


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

// list of token types and the regular expressions
// that will catch them
// the ^ makes sure it only matches at the beginning
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


// returns a list of tokens (see above)
function lex(text) {
    const lines = text.split(/\n/);
    const tokens = [];
    let row = 0;
    let pos = -1; // keeps track of the cursor position so that we can highlight
    for(line0 of lines) {
        let line = line0;
        let commentOffset = 0; // add to 'pos' at the end of lexing the line
        if(line.indexOf("//") > -1) {
            line = line0.substring(0, line0.indexOf("//"));
            commentOffset = line0.substring(line0.indexOf("//")).length;
        }
        let col = 0;
        row++;
        pos++;
        while(line.length > 0) {
            if(line[0] == ' ') { // remove all spaces (tabs are banned)
                col++;
                pos++;
                line = line.substring(1);
                continue;
            }
            let match = null;
            let type = null;
            for(tokenType in table) {
                // run the regex, returns 'null' if it doesn't match
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
