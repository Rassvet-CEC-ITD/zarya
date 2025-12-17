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
    private Long id;

    private String text;

    @Column(name = "y_index")
    private Long yIndex;
}
