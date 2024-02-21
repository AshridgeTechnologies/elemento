import UndoRedoStack from '../../src/editor/UndoRedoStack'

class A {
    constructor(readonly x: number) {}
}

const a1 = new A(1), a2 = new A(2), a3 = new A(3), a4 = new A(4), a5 = new A(5)
let onChange: (val: any) => void

beforeEach( ()=> onChange = jest.fn() )

test('if no object passed to constructor current state is undefined', () => {
    const stack = new UndoRedoStack(onChange)
    expect(stack.current()).toBe(undefined)
})

test('object passed to constructor becomes current state', () => {
    const stack = new UndoRedoStack(onChange, a1)
    expect(stack.current()).toBe(a1)
    expect(onChange).not.toHaveBeenCalled()
})

test('after reset current state is undefined', () => {
    const stack = new UndoRedoStack(onChange)
    stack.update(a2)
    stack.update(a3)
    stack.clear()
    expect(stack.current()).toBe(undefined)
    expect(onChange).toHaveBeenCalledTimes(3)
})

test('object passed to set becomes only current state', () => {
    const stack = new UndoRedoStack(onChange, a1)
    stack.update(a2)
    stack.set(a3)
    expect(stack.current()).toBe(a3)
    expect(onChange).toHaveBeenCalledTimes(2)
    stack.undo()
    expect(stack.current()).toBe(a3)
    expect(onChange).toHaveBeenCalledTimes(2)
})

test('object passed to update becomes current state', () => {
    const stack = new UndoRedoStack<A>(onChange, a1)
    stack.update(a2)
    expect(stack.current()).toBe(a2)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(a2)
})

test('object passed to update after no initial state to constructor becomes only current state', () => {
    const stack = new UndoRedoStack<A>(onChange)
    stack.update(a2)
    expect(stack.current()).toBe(a2)
    stack.undo()
    expect(stack.current()).toBe(a2)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(a2)
})

test('undo goes back to previous state', () => {
    const stack = new UndoRedoStack<A>(onChange, a1)
    stack.update(a2)
    stack.undo()
    expect(stack.current()).toBe(a1)
    expect(onChange).toHaveBeenCalledTimes(2)
    expect(onChange).toHaveBeenNthCalledWith(1, a2)
    expect(onChange).toHaveBeenNthCalledWith(2, a1)
})

test('undo at first state changes nothing', () => {
    const stack = new UndoRedoStack<A>(onChange, a1)
    stack.undo()
    expect(onChange).not.toHaveBeenCalled()
    expect(stack.current()).toBe(a1)

    stack.update(a2)
    stack.undo()
    stack.undo()
    expect(stack.current()).toBe(a1)
    expect(onChange).toHaveBeenCalledTimes(2)
    expect(onChange).toHaveBeenNthCalledWith(1, a2)
    expect(onChange).toHaveBeenNthCalledWith(2, a1)
})

test('undo followed by updates replaces with new states', () => {
    const stack = new UndoRedoStack<A>(onChange, a1)
    stack.update(a2)
    stack.update(a3)
    expect(stack.current()).toBe(a3)
    stack.undo()
    stack.undo()
    stack.update(a4)
    stack.update(a5)
    expect(stack.current()).toBe(a5)
    stack.undo()
    expect(stack.current()).toBe(a4)
    stack.undo()
    expect(stack.current()).toBe(a1)

    expect(onChange).toHaveBeenCalledTimes(8)
})

test('undo followed by redo goes back to undone states', () => {
    const stack = new UndoRedoStack<A>(onChange, a1)
    stack.update(a2)
    stack.update(a3)
    stack.undo()
    stack.undo()
    expect(stack.current()).toBe(a1)
    stack.redo()
    stack.redo()
    expect(stack.current()).toBe(a3)
    expect(onChange).toHaveBeenCalledTimes(6)
})

test('redo at end of list does nothing', () => {
    const stack = new UndoRedoStack<A>(onChange, a1)
    stack.update(a2)
    stack.update(a3)
    stack.redo()
    expect(stack.current()).toBe(a3)
    expect(onChange).toHaveBeenCalledTimes(2)
    expect(onChange).toHaveBeenNthCalledWith(1, a2)
    expect(onChange).toHaveBeenNthCalledWith(2, a3)
})

test('updates clear redo history', () => {
    const stack = new UndoRedoStack<A>(onChange, a1)
    stack.update(a2)
    stack.update(a3)
    expect(stack.current()).toBe(a3)
    stack.undo()
    stack.undo()
    stack.update(a4)
    expect(stack.current()).toBe(a4)
    stack.redo()
    expect(stack.current()).toBe(a4)
    expect(onChange).toHaveBeenCalledTimes(5)
})

test('undo is limited to number of states set in constructor', () => {
    const stack = new UndoRedoStack<A>(onChange, a1, 3)
    stack.update(a2)
    stack.update(a3)
    stack.update(a4)
    stack.update(a5)
    expect(stack.current()).toBe(a5)
    stack.undo()
    stack.undo()
    expect(stack.current()).toBe(a3)
    stack.undo()
    expect(stack.current()).toBe(a3)
    expect(onChange).toHaveBeenCalledTimes(6)
})

test('undo and redo on empty stack have no effect', () => {
    const stack = new UndoRedoStack(onChange)
    stack.undo()
    stack.redo()
    expect(onChange).not.toHaveBeenCalled()
})
