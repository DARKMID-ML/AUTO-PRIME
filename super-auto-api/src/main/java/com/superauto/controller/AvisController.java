package com.superauto.controller;

import com.superauto.config.AccesRole;
import com.superauto.dto.AvisDTO;
import com.superauto.service.AvisService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * API témoignages clients.
 * Lecture publique ; écriture réservée à l'admin et au compte `dev`.
 */
@RestController
@RequestMapping("/api/avis")
public class AvisController {

    private final AvisService service;

    public AvisController(AvisService service) {
        this.service = service;
    }

    @GetMapping
    public List<AvisDTO> getAll() {
        return service.getAll();
    }

    @PostMapping
    public ResponseEntity<AvisDTO> create(@Valid @RequestBody AvisDTO dto,
                                          HttpServletRequest request) {
        if (!AccesRole.estAdminOuDev(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        dto.setId(null);
        return ResponseEntity.ok(service.save(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AvisDTO> update(@PathVariable Long id,
                                          @Valid @RequestBody AvisDTO dto,
                                          HttpServletRequest request) {
        if (!AccesRole.estAdminOuDev(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        if (service.getById(id) == null) {
            return ResponseEntity.notFound().build();
        }
        dto.setId(id);
        return ResponseEntity.ok(service.save(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, HttpServletRequest request) {
        if (!AccesRole.estAdminOuDev(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        if (service.getById(id) == null) {
            return ResponseEntity.notFound().build();
        }
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
