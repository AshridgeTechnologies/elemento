Formula improvements Part 2
===========================

- ✅ Stop invalid formulas being generated into code eg TextInput InitialValue of "xx  (no closing quote)
- ✅ When reference unknown property eg Data1.valu,  show undefined in app
- ✅ Prevent blow-up for reference to unknown name in object value eg const state = useObjectStateWithDefaults(props.path, { Data1: {value: {a: 10, b: true, c }}, })
- ✅ Error for incomplete object literals eg {Name}
- ✅ Error for Objects are not valid as a React child when put Data.value in a Text content
- ✅ Functions without brackets do not blow up in React
- ✅ Improve auto use of value - proxy, code generation?
- Runtime errors reported in the editor, with link to control  --> Part 3
- Functions without brackets give error  --> Part 3
- Reset(page/control) function  --> Part 3
- Error for reference to unknown property eg Data1.valu  --> Part 3

Auto use value of controls
--------------------------

- Still need to refer to whole control in some places
- May occur in operator expressions
- Could pre-process function arguments
- BUT control names may occur in operator expressions
- A combination of coercing function arguments and adding valueOf to state objects should work
- Just referencing control does not get the value when supplied to other control props
- Also need to use Data1.value.Name - could add getters for value props to top level

Proxy
-----

- Could handle all the valueOf, path, and update stuff
- Could give out nested properties of value
- Could give error when no nested property of value
- Could wrap results in a Proxy, so could do Set(data.x.y.z, 99)  --> Part 3
