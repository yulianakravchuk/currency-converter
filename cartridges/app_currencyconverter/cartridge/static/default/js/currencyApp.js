new Vue({
    el: '#currencyApp',
    data() {
        return {
            info: {
              currencyTo: 'USD'
            },
            loading: true,
            errored: false,
            error: {},
            selectFrom: 'EUR'
        };
    },
    filters: {
        currencydecimal(value) {
            return value.toFixed(2);
        }
    },
    computed: {
      countTo: function () {
          if (this.info.rates) {
              let rate = this.info.rates[this.info.currencyTo];
              return this.info.countFrom * rate;
          } else {
              return 'Service is not available';
          }
      }
    },
    mounted() {
        this.ratesUrl = this.$refs['action'].dataset.urlRates;
        axios.get(this.ratesUrl)
          .then(response => {
              this.info = response.data;
          })
          .catch(error => {
              console.log(error);
              this.errored = true;
          })
          .finally(() => (this.loading = false));
    },
    methods:{
        updateRates: function(event) {
            axios.get(this.ratesUrl, {
                params: {
                    currencyFrom: event.target.value,
                    currencyTo: this.info.currencyTo,
                    count: this.info.countFrom
                }
            })
          .then(response => {
              if (response.data.success) {
                  this.info = response.data;
                  this.errored = null;
              } else {
                  this.error = response.data.error.error;
                  this.errored = true;
                  this.info.countTo = '';
              }
          })
          .catch(error => {
              console.log(error);
              this.errored = true;
          })
          .finally(() => (this.loading = false));
        },
        isNumber: function(evt) {
            evt = (evt) ? evt : window.event;
            var charCode = (evt.which) ? evt.which : evt.keyCode;
            if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
                evt.preventDefault();
            } else {
                return true;
            }
        },
        change: function(event) {
            let val = event.target.value.trim();
            if (/^\d{0,9}(\.\d{0,5})?$/.test(val)) {
                this.oldNum = val;
            } else {
                event.target.value = 1;
                this.info.countFrom = 1;
            }
        }
    }
});