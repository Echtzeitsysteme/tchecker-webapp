interface Term {
  identifier?: string;
  value?: string;
  insideBrackets?: Term;
  minus?: string;
  term?: Term;
  termInParen?: Term;
  termInParenL?: Term;
  termL?: Term;
  termR?: Term;
  maths?: string;
}

interface CmpTerm {
  lhs?: Term;
  mhs?: Term;
  rhs?: Term;
  comparatorL?: string;
  comparatorR?: string;
  comparator?: string;
}

interface Constr {
  cmpterm?: CmpTerm;
  not?: string;
  constterm?: Term;
}

interface Statement {
  doTerm?: DoTerm;
  nop?: string;
  localStatement?: LocalStatement;
  ifStatement?: IfStatement;
  whileStatement?: WhileStatement;
}

interface DoTerm {
  lhs?: Term;
  set?: string;
  rhs?: Term;
}

interface LocalStatement {
  local?: string;
  identifier?: string;
  insideBrackets?: Term;
  set?: string;
  term?: Term;
}

interface IfStatement {
  if?: string;
  ifConstr?: Constr[];
  then?: string;
  thenStmt?: Statement[];
  else?: string;
  elseStmt?: Statement[];
  end?: string;
}

interface WhileStatement {
  while?: string;
  whileConstr?: Constr[];
  do?: string;
  doStmt?: Statement[];
  end?: string;
}

//"recursive" variable to make sure it doesnt turn the element into a "potentialClockReset" in a Statement calling itself recursively
export function handleStatement(stmt: Statement, recursive: boolean = false) {
  let expr = '';
  const potentialClockReset: { lhs: string; set: string; rhs: string } = { lhs: '', set: '', rhs: '' };
  if (stmt.doTerm !== undefined) {
    if (stmt.doTerm.lhs !== undefined && stmt.doTerm.set !== undefined && stmt.doTerm.rhs !== undefined) {
      //check for clock-resets
      if (
        !recursive &&
        stmt.doTerm.rhs.term !== undefined &&
        stmt.doTerm.rhs.term.value !== undefined &&
        parseInt(stmt.doTerm.rhs.term.value) === 0 &&
        stmt.doTerm.set === '='
      ) {
        //could be clock if identifier | but can it also be bracket, e.g. clock[term]? I assume no, for now.
        //if possible, delete this part and let do-statement with the usual "expr += ..." be created
        if (
          stmt.doTerm.lhs.term !== undefined &&
          stmt.doTerm.lhs.term.identifier !== undefined &&
          stmt.doTerm.lhs.term.insideBrackets === undefined
        ) {
          potentialClockReset.rhs = stmt.doTerm.rhs.term.value.toString();
          potentialClockReset.set = stmt.doTerm.set;
          potentialClockReset.lhs = stmt.doTerm.lhs.term.identifier.toString();
          return potentialClockReset;
        }
      } else {
        expr += handleTerm(stmt.doTerm.lhs) + stmt.doTerm.set + handleTerm(stmt.doTerm.rhs);
        return expr;
      }
    }
  } else if (stmt.nop !== undefined) {
    return stmt.nop;
  } else if (stmt.ifStatement !== undefined) {
    if (stmt.ifStatement.if !== undefined && stmt.ifStatement.ifConstr !== undefined) {
      expr += stmt.ifStatement.if + ' ' + handleConstraints(stmt.ifStatement.ifConstr);
    }
    if (stmt.ifStatement.then !== undefined && stmt.ifStatement.thenStmt !== undefined) {
      expr += ' ' + stmt.ifStatement.then + ' ' + handleStatements(stmt.ifStatement.thenStmt);
    }
    if (stmt.ifStatement.else !== undefined && stmt.ifStatement.elseStmt !== undefined) {
      expr += ' ' + stmt.ifStatement.else + ' ' + handleStatements(stmt.ifStatement.elseStmt);
    }
    if (stmt.ifStatement.end !== undefined) {
      expr += ' ' + stmt.ifStatement.end;
    }
    return expr;
  } else if (stmt.localStatement !== undefined) {
    if (stmt.localStatement.local !== undefined && stmt.localStatement.identifier !== undefined) {
      expr += stmt.localStatement.local + ' ' + stmt.localStatement.identifier;
    }
    if (stmt.localStatement.insideBrackets !== undefined) {
      expr += '[' + handleTerm(stmt.localStatement.insideBrackets) + ']';
    }
    if (stmt.localStatement.set !== undefined && stmt.localStatement.term !== undefined) {
      expr += stmt.localStatement.set + handleTerm(stmt.localStatement.term);
    }
    return expr;
  } else if (stmt.whileStatement !== undefined) {
    if (stmt.whileStatement.while !== undefined && stmt.whileStatement.whileConstr !== undefined) {
      expr += stmt.whileStatement.while + ' ' + handleConstraints(stmt.whileStatement.whileConstr);
    }
    if (stmt.whileStatement.do !== undefined && stmt.whileStatement.doStmt !== undefined) {
      expr += ' ' + stmt.whileStatement.do + ' ' + handleStatements(stmt.whileStatement.doStmt);
    }
    if (stmt.whileStatement.end !== undefined) {
      expr += ' ' + stmt.whileStatement.end;
    }
    return expr;
  }
  throw Error(`uploadUtils: Input ${stmt} is not a valid statement`);
}

export function handleConstr(constr: Constr): string {
  let term = '';
  if (constr.cmpterm !== undefined) {
    if (constr.not !== undefined) {
      term += '!';
    }
    if (constr.cmpterm.lhs !== undefined) {
      term += handleTerm(constr.cmpterm.lhs);
    }
    if (constr.cmpterm.comparatorL !== undefined) {
      term += constr.cmpterm.comparatorL;
    }
    if (constr.cmpterm.mhs !== undefined) {
      term += handleTerm(constr.cmpterm.mhs);
    }
    if (constr.cmpterm.comparatorR !== undefined) {
      term += constr.cmpterm.comparatorR;
    }
    if (constr.cmpterm.comparator !== undefined) {
      term += constr.cmpterm.comparator;
    }
    if (constr.cmpterm.rhs !== undefined) {
      term += handleTerm(constr.cmpterm.rhs);
    }
    return term;
  } else if (constr.constterm !== undefined) {
    return handleTerm(constr.constterm);
  }
  throw Error(`uploadUtils: Input ${constr} is not a valid cmpterm`);
}

export function handleTerm(term: Term): string {
  if (term.value) {
    return String(term.value);
  } else if (term.identifier && term.insideBrackets) {
    return term.identifier + '[' + handleTerm(term.insideBrackets) + ']';
  } else if (term.identifier) {
    return term.identifier;
  } else if (term.minus && term.term) {
    return term.minus + handleTerm(term.term);
  } else if (term.term) {
    return handleTerm(term.term);
  } else if (term.termInParen) {
    return '(' + handleTerm(term.termInParen) + ')';
  } else if (term.termL && term.maths && term.termR) {
    return handleTerm(term.termL) + term.maths + handleTerm(term.termR);
  } else if (term.termInParenL && term.maths && term.termR) {
    return '(' + handleTerm(term.termInParenL) + ')' + term.maths + handleTerm(term.termR);
  }
  throw Error(`uploadUtils: Input ${term} is not a valid term`);
}

//internal, for while- and if-statements
function handleStatements(stmts: Statement[]): string {
  let term = '';
  let first: boolean = true;
  stmts.forEach((stmt) => {
    if (first) {
      term += ' ';
      first = false;
    } else {
      term += ' &&';
    }
    term += handleStatement(stmt, true);
  });
  return term;
}

//internal, for while- and if-statements
function handleConstraints(constrs: Constr[]): string {
  let term = '';
  let first: boolean = true;
  constrs.forEach((constr) => {
    if (first) {
      term += ' ';
      first = false;
    } else {
      term += ' &&';
    }
    term += handleConstr(constr);
  });
  return term;
}
