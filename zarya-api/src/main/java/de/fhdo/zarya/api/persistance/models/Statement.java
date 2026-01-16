package de.fhdo.zarya.api.persistance.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "statement")
public class Statement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="text", nullable=false)
    private String text;

    @Column(name = "is_categorical", nullable = false)
    private boolean isCategorical;

    @Column(name = "y_index", nullable = false)
    private Long YIndex;
}
