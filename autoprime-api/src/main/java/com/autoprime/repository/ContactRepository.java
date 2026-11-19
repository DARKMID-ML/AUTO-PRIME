package com.autoprime.repository;

import com.autoprime.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;

/** Accès aux données de la table "contacts" (boîte de réception admin). */
public interface ContactRepository extends JpaRepository<Contact, Long> {
}
