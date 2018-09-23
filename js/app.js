(function (window) {
	'use strict';

	let todos_test = [
		{
			id: 1,
			content: '吃饭',
			completed: false
		},
		{
			id: 2,
			content: '睡觉',
			completed: false
		},
		{
			id: 3,
			content: '打豆豆',
			completed: true
		}
	]

	// filter object
	let filter = {
		all(todos) {
			return todos
		},
		active(todos) {
			return todos.filter((item) => {
				return !item.completed
			})
		},
		completed(todos) {
			return todos.filter((item) => {
				return item.completed
			})
		}
	}

	// global directive
	// operate DOM
	// directive hook function
	// v-focus
	Vue.directive('focus', {
		inserted: function (el) {
			el.focus()
		}
	})

	let STORAGE_KEY = 'todos-vuejs-2.0'
	let app = new Vue({
		el: '.todoapp',
		data() {
			return {
				newTodo: '',
				// JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
				todos: [],
				currentEditing: null,
				visibility: 'all'
				// here this is window
			}
		},

		// if use this keyword, do not use arrow function, otherwise this point to window
		methods: {
			addTodo(event) {
				// can not define newTodo
				// let content = event.target.value.trim();
				if (!this.newTodo) return
				let lastTodo = this.todos[this.length - 1]
				let id = lastTodo ? lastTodo.id + 1 : 1
				this.todos.push({
					id,
					content: this.newTodo,
					completed: false
				})
				// event.target.value = ''
				this.newTodo = ''
			},

			removeTodo(index) {
				this.todos.splice(index, 1)
			},

			editTodo(todo) {
				this.editCache = todo.content
				this.currentEditing = todo
			},

			doneEdit(todo, index) {
				if (!this.currentEditing) {
					return
				}
				this.currentEditing = null
				if (!todo.content) {
					this.removeTodo(index)
				}
			},

			cancelEdit(todo) {
				this.currentEditing = null
				todo.content = this.editCache
			},

			clear() {
				this.todos = filter.active(this.todos)
			}

			// 方法也可以用于模板绑定
			// 返回值渲染到绑定位置
			// getLeftTodoCount() {
			// 	return filter.active(this.todos).length
			// }
		},

		// 看着是方法但当属性使用
		// computed和methods能达到同样的效果
		// 但computed有缓存,其触发依赖于计算的数据
		// 方法只要模板发生变化就会被调用
		computed: {
			// UI loop filterTodos, it is filted result of todos
			filteredTodos() {
				return filter[this.visibility](this.todos)
			},

			leftTodoCount() {
				return filter.active(this.todos).length
			},

			toggleState: {
				get() {
					return this.leftTodoCount === 0
				},

				set(val) {
					this.todos.forEach(item => item.completed = val)
				}
			}
		},

		filters: {
			pluralize(n) {
				return n === 1 ? 'item' : 'items'
			}
		},

		directives: {
			// html模板使用的时候用连字符
			// 以下是简写方式, 你可能想在 bind 和 update 时触发相同行为，而不关心其它的钩子
			// 'editing-focus': function (el, binding) {
			editingFocus(el, binding) {
				if (binding.value) {
					el.focus()
				}
			}
		},

		// computed一般用于返回数据
		// watch用于业务逻辑 不需要模板绑定, 只是纯粹监视成员改变而加入业务功能
		watch: {
			// 默认只监视一层
			// deep: true
			// immediate: true
			todos: {
				handler: function (val, oldVal) {
					window.localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
				},
				deep: true
			}
		},

		// here is just for example
		// 可以直接赋值在data属性里面
		created() {
			// todos_test.forEach((data) => {
			// 	this.todos.push(data)
			// })
			this.todos = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
		}
	})

	function onHashChange() {
		let visibility = window.location.hash.replace(/#\/?/, '')
		if (filter[visibility]) {
			app.visibility = visibility
		// 容错
		} else {
			window.location.hash = ''
			app.visibility = 'all'
		}
	}

	window.addEventListener('hashchange', onHashChange)

	// 首次调用, fix刷新后hash不是默认
	onHashChange()

	//app.$mount('.todoapp')
})(window);
