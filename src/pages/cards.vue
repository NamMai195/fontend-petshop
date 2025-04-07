<template>
  <div>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon
              icon="mdi-cards-outline"
              class="me-3"
            />
            <span>Cards</span>
          </v-card-title>

          <v-card-text>
            <v-row>
              <v-col
                v-for="n in 3"
                :key="n"
                cols="12"
                md="4"
              >
                <v-card>
                  <v-img
                    src="https://picsum.photos/200/300"
                    height="200"
                    cover
                  />

                  <v-card-title>Card Title</v-card-title>

                  <v-card-text>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </v-card-text>

                  <v-card-actions>
                    <v-btn
                      color="primary"
                      variant="text"
                    >
                      Action
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template> 