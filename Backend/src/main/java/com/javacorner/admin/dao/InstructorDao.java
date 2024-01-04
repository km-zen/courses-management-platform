package com.javacorner.admin.dao;

import com.javacorner.admin.entity.Instructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InstructorDao extends JpaRepository<Instructor, Long> {

    @Query(value = "select i from Instructor as i where i.firstName like %:name% or i.lastName like %:name%")
    Page<Instructor> findInstructorByName(@Param("name") String name, PageRequest pageRequest);

    @Query(value = "select i from Instructor as i where i.user.email=:email ")
    Instructor findInstructorByEmail(@Param("email") String email);
}
