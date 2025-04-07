<template>
  <div>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon
              icon="mdi-account-cog-outline"
              class="me-3"
            />
            <span>Account Settings</span>
          </v-card-title>

          <v-card-text>
            <v-form @submit.prevent>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="formData.firstName"
                    label="First Name"
                    placeholder="John"
                  />
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="formData.lastName"
                    label="Last Name"
                    placeholder="Doe"
                  />
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="formData.email"
                    label="E-mail"
                    placeholder="john.doe@example.com"
                  />
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="formData.phone"
                    label="Phone"
                    placeholder="+1 (123) 456-7890"
                  />
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="formData.address"
                    label="Address"
                    placeholder="123 Main St, New York, NY 10001"
                  />
                </v-col>

                <v-col cols="12">
                  <v-btn
                    color="primary"
                    type="submit"
                  >
                    Save Changes
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
})
</script> 