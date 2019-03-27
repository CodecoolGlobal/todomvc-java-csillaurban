package com.codecool.todolist.controller.repository;

import com.codecool.todolist.controller.model.Status;
import com.codecool.todolist.controller.model.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import javax.transaction.Transactional;
import java.util.List;

public interface TodoRepository extends JpaRepository<Todo, Long> {

    @Query(value="SELECT * FROM todo ORDER BY id", nativeQuery = true)
    List<Todo> findAndOrderById();

    List<Todo> findAllByStatusOrderById(Status status);

    @Modifying
    @Transactional
    void removeTodosByStatusEquals(Status status);

    @Modifying
    @Transactional
    void removeTodoById(Long id);

    Todo findTodoById(Long id);

    @Modifying
    @Transactional
    @Query(value="UPDATE todo SET title=?2 WHERE id=?1", nativeQuery = true)
    void updateTitle(Long id, String title);

    @Modifying
    @Transactional
    @Query(value="UPDATE todo SET status=?1", nativeQuery = true)
    void updateStatus(String status);

    @Modifying
    @Transactional
    @Query(value="UPDATE todo SET status=?1 WHERE id=?2", nativeQuery = true)
    void updateStatusByID(String status, Long id);
}
