package com.codecool.todolist.controller.controller;

import com.codecool.todolist.controller.model.Status;
import com.codecool.todolist.controller.model.Todo;
import com.codecool.todolist.controller.repository.TodoRepository;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
public class TodoController {
    private static final String SUCCESS = "{\"success\":true}";

    @Autowired
    private TodoRepository todoRepository;

    @PostMapping("/addTodo")
    public String addTodo(@RequestParam("todo-title") String title) {
        Todo todo = Todo.builder()
                .title(title)
                .status(Status.ACTIVE)
                .build();
        todoRepository.saveAndFlush(todo);
        return SUCCESS;
    }

    @PostMapping("/list")
    public String listTodos(@RequestParam("status") String status) {
        JSONArray todos = new JSONArray();
        List<Todo> todoList = new ArrayList<>();

        if(status.isEmpty()) {
            todoList = todoRepository.findAndOrderById();
        } else {
            todoList = todoRepository.findAllByStatusOrderById(Status.valueOf(status.toUpperCase()));
        }

        for (Todo todo: todoList
             ) {
            JSONObject jsonTodo = new JSONObject();
            Status todoStatus = todo.getStatus();
            try {
                jsonTodo.put("id", todo.getId());
                jsonTodo.put("title", todo.getTitle());
                if(todoStatus.equals(Status.COMPLETE)) {
                    jsonTodo.put("completed", true);
                } else {
                    jsonTodo.put("completed", false);
                }
                todos.put(jsonTodo);
            } catch (JSONException e) {
                System.out.println("Creating json object failed: " + e);
            }
        }
        return todos.toString();
    }

    @DeleteMapping("/todos/completed")
    public String removeCompleted() {
        todoRepository.removeTodosByStatusEquals(Status.COMPLETE);
        return SUCCESS;
    }

    @PutMapping("/todos/toggle_all")
    public String toggleAll(@RequestParam("toggle-all") String complete) {
        boolean completed = complete.equals("true");
        List<Todo> todos = todoRepository.findAll();
        if(completed) {
            todoRepository.updateStatus(String.valueOf(Status.COMPLETE));
        } else {
            todoRepository.updateStatus(String.valueOf(Status.ACTIVE));
        }
        return SUCCESS;
    }

    @DeleteMapping("/todos/{id}")
    public String removeById(@PathVariable("id") Long id) {
        todoRepository.removeTodoById(id);
        return SUCCESS;
    }

    @PutMapping("/todos/{id}")
    public String updateById(@PathVariable("id") Long id, @RequestParam("todo-title") String title) {
        todoRepository.updateTitle(id, title);
        return SUCCESS;
    }

    @GetMapping("/todos/{id}")
    public String findTodoById(@PathVariable("id") Long id) {
        return todoRepository.findTodoById(id).getTitle();
    }

    @PutMapping("/todos/{id}/toggle_status")
    public String toggleStatusById(@PathVariable("id") Long id, @RequestParam("status") String status) {
        boolean completed = status.equals("true");
        if(completed) {
            todoRepository.updateStatusByID("COMPLETE", id);
        } else {
            todoRepository.updateStatusByID("ACTIVE", id);
        }
        return SUCCESS;
    }
}
