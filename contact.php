<?php
            if ($_SERVER["REQUEST_METHOD"] == "POST") {
                // Récupérer les données du formulaire
                $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
                $subject = filter_var($_POST['subject'], FILTER_SANITIZE_STRING);
                $message = htmlspecialchars($_POST['message']);

                // Définir l'adresse de destination et l'en-tête
                $to = "romwei0302@gmail.com";
                $headers = "From: " . $email . "\r\n";
                $headers .= "Reply-To: " . $email . "\r\n";
                $headers .= "Content-type: text/html; charset=UTF-8\r\n";

                // Envoyer l'email
                if (mail($to, $subject, nl2br($message), $headers)) {
                    echo "<p>Votre message a été envoyé avec succès !</p>";
                } else {
                    echo "<p>Une erreur s'est produite lors de l'envoi du message.</p>";
                }
            }
            ?>