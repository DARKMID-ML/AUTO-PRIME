package com.superauto.controller;

import com.superauto.dto.DevisTransitDTO;
import com.superauto.service.DevisTransitService;
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

/** API devis-transit : formulaire public et boîte de réception admin. */
@RestController
@RequestMapping("/api/devis-transit")
public class DevisTransitController {

    private final DevisTransitService service;

    public DevisTransitController(DevisTransitService service) {
        this.service = service;
    }

    @GetMapping
    public List<DevisTransitDTO> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DevisTransitDTO> getById(@PathVariable Long id) {
        DevisTransitDTO devis = service.getById(id);
        return devis == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(devis);
    }

    /** Formulaire public : crée la demande de devis. */
    @PostMapping
    public DevisTransitDTO create(@Valid @RequestBody DevisTransitDTO dto) {
        dto.setId(null);
        return service.save(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DevisTransitDTO> update(@PathVariable Long id,
                                                  @Valid @RequestBody DevisTransitDTO dto) {
        if (service.getById(id) == null) {
            return ResponseEntity.notFound().build();
        }
        dto.setId(id);
        return ResponseEntity.ok(service.save(dto));
    }

    /** Marque une demande comme contactée / archivée. */
    @PatchMapping("/{id}/statut")
    public ResponseEntity<DevisTransitDTO> changerStatut(@PathVariable Long id,
                                                         @RequestBody Map<String, String> corps) {
        DevisTransitDTO modifie = service.changerStatut(id, corps.getOrDefault("statut", "contacted"));
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
