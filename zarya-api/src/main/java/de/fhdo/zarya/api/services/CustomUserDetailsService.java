package de.fhdo.zarya.api.services;

import de.fhdo.zarya.api.interfaces.repositories.UserRepository;
import de.fhdo.zarya.api.persistance.models.User;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@AllArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByName(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getName())
                .password(user.getPassword())
                .authorities(mapRolesToAuthorities(user))
                .disabled(!user.getEnabled())
                .build();
    }

    @Transactional
    public User registerUser(String name, String contact, String password) {
        if (userRepository.existsByName(name)) {
            throw new IllegalArgumentException("Username already exists");
        }

        User user = new User();
        user.setName(name);
        user.setContact(contact);
        user.setPassword(passwordEncoder.encode(password));
        user.setEnabled(true);

        Set<User.RoleName> roles = new HashSet<>();
        roles.add(User.RoleName.ROLE_DATA_SCIENTIST);
        user.setRoles(roles);

        return userRepository.save(user);
    }

    private Collection<? extends GrantedAuthority> mapRolesToAuthorities(User user) {
        return user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.name()))
                .collect(Collectors.toList());
    }
}
