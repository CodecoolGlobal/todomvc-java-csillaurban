package com.codecool.todolist.controller;

import com.codecool.todolist.controller.model.Status;
import com.codecool.todolist.controller.model.Todo;
import com.codecool.todolist.controller.repository.TodoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class BasicTodoListApplication {
    @Autowired
    private TodoRepository todoRepository;

    public static void main(String[] args) {
        SpringApplication.run(BasicTodoListApplication.class, args);
    }

    @Bean
    public CommandLineRunner init() {

        return args -> {
            Todo todo1 = Todo.builder()
                    .status(Status.ACTIVE)
                    .title("todo1")
                    .build();

            todoRepository.save(todo1);

            Todo todo2 = Todo.builder()
                    .status(Status.ACTIVE)
                    .title("todo2")
                    .build();

            todoRepository.save(todo2);

            Todo todo3 = Todo.builder()
                    .status(Status.ACTIVE)
                    .title("todo3")
                    .build();

            todoRepository.save(todo3);

            Todo todo4 = Todo.builder()
                    .status(Status.ACTIVE)
                    .title("todo4")
                    .build();

            todoRepository.save(todo4);
        };
    }

}
