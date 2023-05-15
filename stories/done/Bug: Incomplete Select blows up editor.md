Bug: Incomplete Select blows up editor
======================================

Problem
-------

- While editing an expression using a Select, editor stops completely with error
- Console error is :
- Uncaught (in promise) Error: undefined does not match field "body": BlockStatement | Expression of type ArrowFunctionExpression
  at addParam (types.js:450:27)
  at types.js:473:25
  at Array.forEach (<anonymous>)
  at Object.builder [as arrowFunctionExpression] (types.js:471:35)
  at Generator.ts:420:47

- Expression being edited was:
{
"id": "function_5",
"name": "Get Random Word",
"kind": "Function",
"properties": {
"input1": "tags",
"calculation": {
"expr": "let possibleWords = Select(GetAll(AllWords))\nlet random = Math.floor(Math.random() * GetAll(AllQuestions).length)\nlet template = GetAll(AllQuestions)[random]\n\"buzz\""
}
},
"elements": []
}

- Commit: 86ccdbd5