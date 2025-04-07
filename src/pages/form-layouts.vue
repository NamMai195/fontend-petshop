<template>
  <div>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon
              icon="mdi-form-select"
              class="me-3"
            />
            <span>Form Layouts</span>
          </v-card-title>

          <v-card-text>
            <v-form @submit.prevent>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="formData.name"
                    label="Name"
                    placeholder="John Doe"
                  />
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="formData.email"
                    label="Email"
                    placeholder="john.doe@example.com"
                    type="email"
                  />
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="formData.password"
                    label="Password"
                    placeholder="············"
                    type="password"
                  />
                </v-col>

                <v-col cols="12">
                  <v-select
                    v-model="formData.country"
                    :items="countries"
                    label="Country"
                    placeholder="Select country"
                  />
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    v-model="formData.bio"
                    label="Bio"
                    placeholder="Tell us about yourself"
                    rows="3"
                  />
                </v-col>

                <v-col cols="12">
                  <v-checkbox
                    v-model="formData.terms"
                    label="I agree to the terms and conditions"
                  />
                </v-col>

                <v-col cols="12">
                  <v-btn
                    color="primary"
                    type="submit"
                  >
                    Submit
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
  name: '',
  email: '',
  password: '',
  country: null,
  bio: '',
  terms: false,
})

const countries = [
  'United States',
  'Canada',
  'United Kingdom',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Japan',
  'China',
  'India',
]
</script> 