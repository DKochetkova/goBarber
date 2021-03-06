import React, { useRef, useCallback } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
    View,
    TextInput,
    Alert,
} from 'react-native';
import * as Yup from 'yup';
import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';
import { useNavigation } from '@react-navigation/native';
import Input from '../../components/Input';
import Button from '../../components/Button';
import BackgroundText from '../../components/BackgroundText';
import getValidationErrors from '../../utils/getValidationErrors';
import { Container, Title, ReturnToLoginLink } from './styles';
import { api } from '../../services/api';
import logoImg from '../../assets/logo.png';

interface RegisterFormData {
    name: string;
    email: string;
    password: string;
}

const Register: React.FC = () => {
    const formRef = useRef<FormHandles>(null);
    const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);

    const navigation = useNavigation();

    const handleRegister = useCallback(
        async (data: RegisterFormData) => {
            try {
                formRef.current?.setErrors({});

                const schema = Yup.object().shape({
                    name: Yup.string().required('You must enter a name'),
                    email: Yup.string()
                        .required('You must enter an email')
                        .email('Invalid email format'),
                    password: Yup.string()
                        .required('You must enter a password')
                        .min(8, 'Password must be at least 8 characters'),
                });

                await schema.validate(data, {
                    abortEarly: false,
                });

                await api.post('/users', data);

                navigation.navigate('Login');

                Alert.alert('Welcome!', 'Account successfully created :)');
            } catch (error) {
                if (error instanceof Yup.ValidationError) {
                    const errors = getValidationErrors(error);

                    formRef.current?.setErrors(errors);
                } else {
                    Alert.alert(
                        'Something went wrong',
                        "Couldn't create an account",
                    );
                }
            }
        },
        [navigation],
    );

    return (
        <KeyboardAvoidingView
            enabled
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={{ flex: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <Container>
                    <Image source={logoImg} style={{ zIndex: 2 }} />
                    <BackgroundText />
                    <View>
                        <Title>Join us</Title>
                    </View>
                    <Form ref={formRef} onSubmit={handleRegister}>
                        <Input
                            name="name"
                            icon="user"
                            placeholder="Name"
                            autoCapitalize="words"
                            returnKeyType="next"
                            onSubmitEditing={(): void => {
                                emailInputRef.current?.focus();
                            }}
                        />
                        <Input
                            name="email"
                            icon="mail"
                            placeholder="Email"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            returnKeyType="next"
                            ref={emailInputRef}
                            onSubmitEditing={(): void => {
                                passwordInputRef.current?.focus();
                            }}
                        />
                        <Input
                            name="password"
                            icon="lock"
                            placeholder="Password"
                            secureTextEntry
                            textContentType="newPassword"
                            returnKeyType="send"
                            ref={passwordInputRef}
                            onSubmitEditing={(): void => {
                                formRef.current?.submitForm();
                            }}
                        />
                        <Button
                            onPress={(): void => {
                                formRef.current?.submitForm();
                            }}
                        >
                            Register
                        </Button>
                    </Form>
                    <ReturnToLoginLink
                        icon="arrow-left"
                        color="#fff"
                        fontSize="19px"
                        onPress={(): void => navigation.navigate('Login')}
                    >
                        I already have an account
                    </ReturnToLoginLink>
                </Container>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Register;
