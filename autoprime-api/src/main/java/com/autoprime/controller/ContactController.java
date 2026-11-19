package com.autoprime.controller;

import com.autoprime.dto.ContactDTO;
import com.autoprime.service.ContactService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/** API contacts : formulaire public et boîte de réception admin. */
@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final ContactService service;

    public ContactController(ContactService service) {
        this.service = service;
    }

    @GetMapping
    public List<ContactDTO> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactDTO> getById(@PathVariable Long id) {
        ContactDTO message = service.getById(id);
        return message == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(message);
    }

    /** Formulaire public : crée le message dans la boîte de réception. */
    @PostMapping
    public ContactDTO create(@Valid @RequestBody ContactDTO dto) {
        dto.setId(null);
        return service.save(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContactDTO> update(@PathVariable Long id,
                                             @Valid @RequestBody ContactDTO dto) {
        if (service.getById(id) == null) {
            return ResponseEntity.notFound().build();
        }
        dto.setId(id);
        return ResponseEntity.ok(service.save(dto));
    }

    /** Marque un message comme lu / archivé. */
    @PatchMapping("/{id}/statut")
    public ResponseEntity<ContactDTO> changerStatut(@PathVariable Long id,
                                                    @RequestBody Map<String, String> corps) {
        ContactDTO modifie = service.changerStatut(id, corps.getOrDefault("statut", "read"));
        return modifie == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(modifie);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (service.getById(id) == null) {
            return ResponseEntity.notFound().build();
        }
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
